// @ts-nocheck
import { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useCanvas = (
  onElementAdded: (element: any, backendType: string) => void,
  readOnly: boolean = false
) => {
  const canvasRef = useRef<any>(null);
  const isInitializedRef = useRef(false); // ✅ Защита от повторной инициализации
  
  const [selectedTool, setSelectedTool] = useState<string>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [zoom, setZoom] = useState<number>(1);

  // Refs для стабильного доступа к значениям в обработчиках
  const toolRef = useRef(selectedTool);
  const colorRef = useRef(selectedColor);
  const strokeRef = useRef(strokeWidth);

  useEffect(() => { toolRef.current = selectedTool; }, [selectedTool]);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { strokeRef.current = strokeWidth; }, [strokeWidth]);

  useEffect(() => {
    // ✅ Если уже инициализирован — выходим
    if (isInitializedRef.current) return;

    const canvasElement = document.getElementById('drawing-canvas');
    if (!canvasElement) {
      console.error('❌ Canvas element not found!');
      return;
    }

    console.log('🎨 Initializing Fabric Canvas...');
    isInitializedRef.current = true;

    const canvas = new fabric.Canvas(canvasElement, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ffffff',
      selection: !readOnly,
    });

    canvasRef.current = canvas;

    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let isDrawing = false;
    let currentShape: any = null;
    let startPoint = { x: 0, y: 0 };

    // 🔑 МАППИНГ ТИПОВ: Fabric → Backend
    const getBackendType = (fabricType: string) => {
      const map: Record<string, string> = {
        'ellipse': 'Circle',
        'rect': 'Rectangle',
        'line': 'Line',
        'path': 'Freehand',
        'i-text': 'Text',
      };
      return map[fabricType] || fabricType;
    };

    // 🔑 ОТПРАВКА ОБЪЕКТА НА СЕРВЕР
    const handleObjectCreation = (obj: any) => {
      obj.set({
        selectable: false,
        evented: false, // 👈 Критично: чтобы объект не перехватывал клики
        hoverCursor: 'default'
      });
      
      const backendType = getBackendType(obj.type);
      console.log(`📤 Sending ${backendType} to backend...`);
      onElementAdded(obj, backendType);
    };

    // Zoom
    canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;
      if (newZoom > 20) newZoom = 20;
      if (newZoom < 0.1) newZoom = 0.1;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), newZoom);
      setZoom(newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // Mouse Down
    canvas.on('mouse:down', (opt: any) => {
      const tool = toolRef.current;
      const color = colorRef.current;
      const stroke = strokeRef.current;

      // Pan (средняя кнопка или Shift)
      if (opt.e.button === 1 || opt.e.shiftKey) {
        panning = true;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        canvas.selection = false;
        canvas.isDrawingMode = false;
        return;
      }

      if (readOnly) return;

      // 🧹 Ластик
      if (tool === 'eraser') {
        canvas.getObjects().forEach((o: any) => {
          o.set({ selectable: true, evented: true });
        });
        canvas.renderAll();

        const target = canvas.findTarget(opt.e);

        canvas.getObjects().forEach((o: any) => {
          o.set({ selectable: false, evented: false });
        });
        canvas.renderAll();

        if (target && target.type !== 'activeSelection') {
          const elementId = target.elementId;
          canvas.remove(target);
          canvas.renderAll();
          // Удаление на сервере обрабатывается отдельно через deleteElement
        }
        return;
      }

      // Рисование фигур
      if (tool !== 'pen') {
        const pointer = canvas.getPointer(opt.e);
        isDrawing = true;
        startPoint = { x: pointer.x, y: pointer.y };

        if (tool === 'rectangle') {
          currentShape = new fabric.Rect({
            left: pointer.x, top: pointer.y, width: 0, height: 0,
            fill: 'transparent', stroke: color, strokeWidth: stroke,
            selectable: false, evented: false
          });
        } else if (tool === 'circle') {
          currentShape = new fabric.Ellipse({
            left: pointer.x, top: pointer.y, rx: 0, ry: 0,
            fill: 'transparent', stroke: color, strokeWidth: stroke,
            selectable: false, evented: false,
            originX: 'center', originY: 'center'
          });
        } else if (tool === 'line') {
          currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: color, strokeWidth: stroke, selectable: false, evented: false
          });
        } else if (tool === 'text') {
          const text = new fabric.IText('Text', {
            left: pointer.x, top: pointer.y, fontSize: 24, fill: color, selectable: true
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          text.enterEditing();
          text.on('editing:exited', () => handleObjectCreation(text));
          isDrawing = false;
          return;
        }

        if (currentShape) canvas.add(currentShape);
      }
    });

    // Mouse Move
    canvas.on('mouse:move', (opt: any) => {
      if (panning && opt.e) {
        const dx = opt.e.clientX - lastX;
        const dy = opt.e.clientY - lastY;
        canvas.relativePan(new fabric.Point(dx, dy));
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        return;
      }

      if (!isDrawing || !currentShape) return;

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

    // Mouse Up
    canvas.on('mouse:up', () => {
      if (panning) {
        panning = false;
        canvas.selection = !readOnly;
        return;
      }
      if (isDrawing && currentShape) {
        handleObjectCreation(currentShape);
        currentShape = null;
      }
      isDrawing = false;
    });

    // Path Created (для pen)
    canvas.on('path:created', (opt: any) => {
      if (opt.path) handleObjectCreation(opt.path);
    });

    // Resize
    const handleResize = () => {
      canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
      canvas.renderAll();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvasRef.current) {
        canvasRef.current.dispose();
      }
      isInitializedRef.current = false;
    };
  }, [onElementAdded, readOnly]);

  // Обновление кисти
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    if (selectedTool === 'pen') {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
      const brush = new fabric.PencilBrush(canvas);
      brush.width = strokeWidth;
      brush.color = selectedColor;
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = selectedTool === 'eraser' ? 'cell' : 'crosshair';
    }
  }, [selectedTool, selectedColor, strokeWidth]);

  // Загрузка элементов из истории
  const loadElements = useCallback((elements: any[]) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';

    const objectsToLoad: any[] = [];
    elements.forEach(el => {
      try {
        objectsToLoad.push(JSON.parse(el.jsonData));
      } catch (e) {
        console.error('Failed to parse element JSON', e);
      }
    });

    if (objectsToLoad.length > 0) {
      fabric.util.enlivenObjects(objectsToLoad, (objects: any[]) => {
        objects.forEach((obj, index) => {
          obj.set({ selectable: false, evented: false, hoverCursor: 'default' });
          if (elements[index]?.id) obj.elementId = elements[index].id;
          canvas.add(obj);
        });
        canvas.renderAll();
      });
    }
  }, []);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      canvasRef.current.backgroundColor = '#ffffff';
      canvasRef.current.renderAll();
    }
  }, []);

  const exportToJPEG = useCallback((): string => {
    if (!canvasRef.current) return '';
    return canvasRef.current.toDataURL({ format: 'jpeg', quality: 0.9 });
  }, []);

  return {
    canvasRef,
    selectedTool, setSelectedTool,
    selectedColor, setSelectedColor,
    strokeWidth, setStrokeWidth,
    zoom,
    loadElements,
    clearCanvas,
    exportToJPEG
  };
};