// @ts-nocheck
import { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useCanvas = (
  onElementAdded: (element: any, backendType: string) => void,
  readOnly: boolean = false
) => {
  const canvasRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const onElementAddedRef = useRef(onElementAdded);

  const [selectedTool, setSelectedTool] = useState<string>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [zoom, setZoom] = useState<number>(1);

  const toolRef = useRef<string>('pen');
  const colorRef = useRef<string>('#000000');
  const strokeRef = useRef<number>(2);

  useEffect(() => { onElementAddedRef.current = onElementAdded; }, [onElementAdded]);
  useEffect(() => { toolRef.current = selectedTool; }, [selectedTool]);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { strokeRef.current = strokeWidth; }, [strokeWidth]);

  useEffect(() => {
    if (isInitializedRef.current) return;

    let attempts = 0;
    const tryInit = () => {
      const canvasElement = document.getElementById('drawing-canvas');
      if (!canvasElement) {
        if (++attempts < 10) setTimeout(tryInit, 100);
        return;
      }

      isInitializedRef.current = true;
      console.log('🎨 Initializing canvas...');

      const canvas = new fabric.Canvas(canvasElement, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#ffffff',
        selection: false,
        preserveObjectStacking: true,
      });

      canvasRef.current = canvas;

      const brush = new fabric.PencilBrush(canvas);
      brush.width = 2;
      brush.color = '#000000';
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true; 

      let panning = false;
      let lastX = 0, lastY = 0;
      let isDrawingShape = false;
      let currentShape: any = null;
      let startPoint = { x: 0, y: 0 };

      const getBackendType = (type: string) => ({
        'ellipse': 'Circle', 'rect': 'Rectangle',
        'line': 'Line', 'path': 'Freehand', 'i-text': 'Text',
      }[type] || type);

      const handleObjectCreation = (obj: any) => {
        obj.set({ selectable: false, evented: false, hoverCursor: 'default', hasControls: false, hasBorders: false });
        const backendType = getBackendType(obj.type);
        console.log(`📤 Sending ${backendType}...`);
        onElementAddedRef.current(obj, backendType); // ← ref!
      };

      canvas.on('path:created', (opt: any) => {
        if (opt.path) handleObjectCreation(opt.path);
      });

      canvas.on('mouse:wheel', (opt: any) => {
        let newZoom = canvas.getZoom() * (0.999 ** opt.e.deltaY);
        newZoom = Math.min(20, Math.max(0.1, newZoom));
        canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), newZoom);
        setZoom(newZoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });

      canvas.on('mouse:down', (opt: any) => {
        const tool = toolRef.current;
        const color = colorRef.current;
        const stroke = strokeRef.current;

        if (opt.e.button === 1 || opt.e.shiftKey) {
          panning = true;
          lastX = opt.e.clientX;
          lastY = opt.e.clientY;
          canvas.isDrawingMode = false;
          return;
        }

        if (readOnly) return;
        if (tool === 'pen') return; 

        canvas.isDrawingMode = false;

        if (tool === 'eraser') {
          const pointer = canvas.getPointer(opt.e);
          const objects = canvas.getObjects();
          for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            obj.evented = true;
            obj.selectable = true;
            const contains = obj.containsPoint(pointer);
            obj.evented = false;
            obj.selectable = false;
            if (contains) {
              canvas.remove(obj);
              canvas.renderAll();
              break;
            }
          }
          return;
        }

        const pointer = canvas.getPointer(opt.e);
        isDrawingShape = true;
        startPoint = { x: pointer.x, y: pointer.y };

        const props = { fill: 'transparent', stroke: color, strokeWidth: stroke, selectable: false, evented: false, hasControls: false, hasBorders: false };

        if (tool === 'rectangle') {
          currentShape = new fabric.Rect({ ...props, left: pointer.x, top: pointer.y, width: 0, height: 0 });
        } else if (tool === 'circle') {
          currentShape = new fabric.Ellipse({ ...props, left: pointer.x, top: pointer.y, rx: 0, ry: 0, originX: 'center', originY: 'center' });
        } else if (tool === 'line') {
          currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], { stroke: color, strokeWidth: stroke, selectable: false, evented: false });
        } else if (tool === 'text') {
          const text = new fabric.IText('', { left: pointer.x, top: pointer.y, fontSize: 24, fill: color, selectable: true });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          text.on('editing:exited', () => handleObjectCreation(text));
          isDrawingShape = false;
          return;
        }

        if (currentShape) canvas.add(currentShape);
      });

      canvas.on('mouse:move', (opt: any) => {
        if (panning && opt.e) {
          canvas.relativePan(new fabric.Point(opt.e.clientX - lastX, opt.e.clientY - lastY));
          lastX = opt.e.clientX;
          lastY = opt.e.clientY;
          return;
        }
        if (!isDrawingShape || !currentShape) return;

        const pointer = canvas.getPointer(opt.e);
        const tool = toolRef.current;

        if (tool === 'rectangle') {
          currentShape.set({ width: Math.abs(pointer.x - startPoint.x), height: Math.abs(pointer.y - startPoint.y), left: Math.min(startPoint.x, pointer.x), top: Math.min(startPoint.y, pointer.y) });
        } else if (tool === 'circle') {
          currentShape.set({ rx: Math.abs(pointer.x - startPoint.x) / 2, ry: Math.abs(pointer.y - startPoint.y) / 2, left: startPoint.x + (pointer.x - startPoint.x) / 2, top: startPoint.y + (pointer.y - startPoint.y) / 2 });
        } else if (tool === 'line') {
          currentShape.set({ x2: pointer.x, y2: pointer.y });
        }
        canvas.renderAll();
      });

      canvas.on('mouse:up', () => {
        if (panning) {
          panning = false;
          if (toolRef.current === 'pen') canvas.isDrawingMode = true;
          return;
        }
        if (isDrawingShape && currentShape) {
          handleObjectCreation(currentShape);
          currentShape = null;
        }
        isDrawingShape = false;
      });

      const handleResize = () => {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
        canvas.renderAll();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
        isInitializedRef.current = false;
      };
    };

    tryInit();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    if (selectedTool === 'pen') {
      canvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(canvas);
      brush.width = Number(strokeWidth);
      brush.color = selectedColor;
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
    }
    canvas.requestRenderAll();
  }, [selectedTool, selectedColor, strokeWidth]);

  const loadInitialElements = useCallback((elements: any[]) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    const toLoad: any[] = [];
    elements.forEach(el => {
      try {
        let parsed = typeof el.jsonData === 'string' ? JSON.parse(el.jsonData) : el.jsonData;
        if (parsed.textBaseline === 'alphabetical') delete parsed.textBaseline;
        toLoad.push(parsed);
      } catch (e) { console.error('Parse error', e); }
    });

    if (toLoad.length > 0) {
      fabric.util.enlivenObjects(toLoad, (objects: any[]) => {
        objects.forEach((obj, i) => {
          obj.set({ selectable: false, evented: false, hoverCursor: 'default', hasControls: false, hasBorders: false });
          if (elements[i]?.id) obj.elementId = elements[i].id;
          canvas.add(obj);
        });
        canvas.renderAll();
        console.log(`✅ Loaded ${objects.length} elements`);
      }, '');
    } else {
      canvas.renderAll();
    }
  }, []);

  const addElementToCanvas = useCallback((element: any) => {
    if (!canvasRef.current) return;
    const exists = canvasRef.current.getObjects().some((o: any) => o.elementId === element.id);
    if (exists) return;

    try {
      let parsed = typeof element.jsonData === 'string' ? JSON.parse(element.jsonData) : element.jsonData;
      if (parsed.textBaseline === 'alphabetical') delete parsed.textBaseline;
      fabric.util.enlivenObjects([parsed], (objects: any[]) => {
        objects.forEach(obj => {
          obj.set({ selectable: false, evented: false, hoverCursor: 'default' });
          if (element.id) obj.elementId = element.id;
          canvasRef.current?.add(obj);
        });
        canvasRef.current?.renderAll();
      }, '');
    } catch (e) { console.error('Add element error', e); }
  }, []);

  const clearCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    canvasRef.current.clear();
    canvasRef.current.backgroundColor = '#ffffff';
    canvasRef.current.renderAll();
  }, []);

  const exportToJPEG = useCallback((): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL({ format: 'jpeg', quality: 0.9 });
  }, []);

  return {
    canvasRef, selectedTool, setSelectedTool,
    selectedColor, setSelectedColor,
    strokeWidth, setStrokeWidth, zoom,
    loadInitialElements, addElementToCanvas,
    clearCanvas, exportToJPEG,
  };
};