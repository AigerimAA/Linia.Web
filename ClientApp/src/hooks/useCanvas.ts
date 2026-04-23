// @ts-nocheck
import { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useCanvas = (
  onElementAdded: (element: any, backendType: string) => void,
  onElementDeleted: (id: string) => void,
  readOnly: boolean = false
) => {
  const canvasRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const onElementAddedRef = useRef(onElementAdded);
  const onElementDeletedRef = useRef(onElementDeleted);
  const elementIdMap = useRef<WeakMap<object, string>>(new WeakMap());
  const lastDrawnObjRef = useRef<any>(null);

  const [selectedTool, setSelectedTool] = useState<string>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [zoom, setZoom] = useState<number>(1);

  const toolRef = useRef<string>('pen');
  const colorRef = useRef<string>('#000000');
  const strokeRef = useRef<number>(2);

  useEffect(() => { onElementAddedRef.current = onElementAdded; }, [onElementAdded]);
  useEffect(() => { onElementDeletedRef.current = onElementDeleted; }, [onElementDeleted]);
  useEffect(() => { toolRef.current = selectedTool; }, [selectedTool]);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { strokeRef.current = strokeWidth; }, [strokeWidth]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    if (selectedTool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.defaultCursor = 'default';
    } else {
      canvas.isDrawingMode = false;
      canvas.defaultCursor = selectedTool === 'eraser' ? 'crosshair' : 'default';
    }
    canvas.requestRenderAll();
  }, [selectedTool]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }
    canvas.freeDrawingBrush.width = strokeWidth;
    canvas.freeDrawingBrush.color = selectedColor;
  }, [selectedColor, strokeWidth]);

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

      const canvas = new fabric.Canvas(canvasElement, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#ffffff',
        selection: false,
        preserveObjectStacking: true,
      });

      canvasRef.current = canvas;

      const brush = new fabric.PencilBrush(canvas);
      brush.width = strokeRef.current;
      brush.color = colorRef.current;
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;

      let panning = false;
      let lastX = 0, lastY = 0;
      let isDrawingShape = false;
      let currentShape: any = null;
      let startPoint = { x: 0, y: 0 };

      const getBackendType = (type: string) => ({
        'ellipse': 'Circle',
        'rect': 'Rectangle',
        'line': 'Line',
        'path': 'Freehand',
        'i-text': 'Text',
      }[type] || type);

      const handleObjectCreation = (obj: any) => {
        obj.set({ selectable: false, evented: false, hoverCursor: 'default', hasControls: false, hasBorders: false });
        lastDrawnObjRef.current = obj;  
        const backendType = getBackendType(obj.type);
        onElementAddedRef.current(obj, backendType);
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
            if (obj === canvas.backgroundImage) continue;
            let isHit = false;
            if (obj.type === 'path') {
              isHit = obj.containsPoint(pointer);
            } else {
              const bound = obj.getBoundingRect(true, true);
              isHit = pointer.x >= bound.left &&
                      pointer.x <= bound.left + bound.width &&
                      pointer.y >= bound.top &&
                      pointer.y <= bound.top + bound.height;
            }
            if (isHit) {
              const elementId = elementIdMap.current.get(obj);
              canvas.remove(obj);
              canvas.requestRenderAll();
              if (elementId) {
                onElementDeletedRef.current(elementId);
              }
              break;
            }
          }
          return;
        }

        const pointer = canvas.getPointer(opt.e);
        isDrawingShape = true;
        startPoint = { x: pointer.x, y: pointer.y };

        const props = {
          fill: 'transparent',
          stroke: color,
          strokeWidth: stroke,
          selectable: false,
          evented: false,
          hasControls: false,
          hasBorders: false,
        };

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
          currentShape.set({
            width: Math.abs(pointer.x - startPoint.x),
            height: Math.abs(pointer.y - startPoint.y),
            left: Math.min(startPoint.x, pointer.x),
            top: Math.min(startPoint.y, pointer.y),
          });
        } else if (tool === 'circle') {
          currentShape.set({
            rx: Math.abs(pointer.x - startPoint.x) / 2,
            ry: Math.abs(pointer.y - startPoint.y) / 2,
            left: startPoint.x + (pointer.x - startPoint.x) / 2,
            top: startPoint.y + (pointer.y - startPoint.y) / 2,
          });
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
        if (toolRef.current === 'pen') canvas.isDrawingMode = true;
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

  const assignElementId = useCallback((elementId: string) => {
    if (lastDrawnObjRef.current) {
      elementIdMap.current.set(lastDrawnObjRef.current, elementId);
      lastDrawnObjRef.current = null;
      console.log('✅ Assigned ID to last drawn obj:', elementId);
    }
  }, []);

  const loadInitialElements = useCallback((elements: any[]) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    elements.forEach(el => {
      try {
        let parsed = typeof el.jsonData === 'string'
          ? JSON.parse(el.jsonData)
          : el.jsonData;
        if (parsed.textBaseline === 'alphabetical') delete parsed.textBaseline;

        fabric.util.enlivenObjects([parsed], (objects: any[]) => {
          const obj = objects[0];
          if (!obj) return;
          obj.set({
            selectable: false,
            evented: false,
            hoverCursor: 'default',
            hasControls: false,
            hasBorders: false,
          });
          elementIdMap.current.set(obj, el.id);
          canvas.add(obj);
          canvas.renderAll();
        }, '');
      } catch (e) {
        console.error('Parse error', e);
      }
    });
  }, []);

  const addElementToCanvas = useCallback((element: any) => {
    if (!canvasRef.current) return;
    const exists = canvasRef.current.getObjects()
      .some((o: any) => elementIdMap.current.get(o) === element.id);
    if (exists) return;

    try {
      let parsed = typeof element.jsonData === 'string'
        ? JSON.parse(element.jsonData)
        : element.jsonData;
      if (parsed.textBaseline === 'alphabetical') delete parsed.textBaseline;

      fabric.util.enlivenObjects([parsed], (objects: any[]) => {
        const obj = objects[0];
        if (!obj) return;
        obj.set({ selectable: false, evented: false, hoverCursor: 'default' });
        elementIdMap.current.set(obj, element.id);
        canvasRef.current?.add(obj);
        canvasRef.current?.renderAll();
      }, '');
    } catch (e) {
      console.error('Add element error', e);
    }
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
  assignElementId,
};
};