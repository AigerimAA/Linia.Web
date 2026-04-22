// @ts-nocheck
import { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';

export const useCanvas = (
  onElementAdded: (element: any, backendType: string) => void,
  readOnly: boolean = false
) => {
  const canvasRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  
  const [selectedTool, setSelectedTool] = useState<string>('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [zoom, setZoom] = useState<number>(1);

  // Refs для стабильного доступа к значениям в обработчиках событий
  const toolRef = useRef(selectedTool);
  const colorRef = useRef(selectedColor);
  const strokeRef = useRef(strokeWidth);

  useEffect(() => { toolRef.current = selectedTool; }, [selectedTool]);
  useEffect(() => { colorRef.current = selectedColor; }, [selectedColor]);
  useEffect(() => { strokeRef.current = strokeWidth; }, [strokeWidth]);

  // Инициализация Canvas
  useEffect(() => {
    if (isInitializedRef.current) return;

    let attempts = 0;
    const maxAttempts = 10;

    const tryInit = () => {
      const canvasElement = document.getElementById('drawing-canvas');
      
      if (!canvasElement) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(tryInit, 100);
        } else {
          console.error('❌ Failed to find canvas after max attempts!');
        }
        return;
      }

      console.log('🎨 Initializing Fabric Canvas...');
      isInitializedRef.current = true;

      const canvas = new fabric.Canvas(canvasElement, {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: '#ffffff',
        selection: !readOnly,
        preserveObjectStacking: true,
      });

      canvasRef.current = canvas;

      // 👇 Инициализируем кисть сразу, чтобы Pen работал с первого клика
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 2;
      canvas.freeDrawingBrush.color = '#000000';

      let panning = false;
      let lastX = 0;
      let lastY = 0;
      let isDrawing = false;
      let currentShape: any = null;
      let startPoint = { x: 0, y: 0 };

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

      const handleObjectCreation = (obj: any) => {
        obj.set({
          selectable: false,
          evented: false, // 👈 Важно для ластика: если false, ластик не найдет объект
          hoverCursor: 'default',
          hasControls: false,
          hasBorders: false
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

        // 🧹 ЛАСТИК: Исправленная логика
        if (tool === 'eraser') {
          // 👇 Ищем цель, игнорируя проверку selectable (второй аргумент false)
          const target = canvas.findTarget(opt.e, false); 

          if (target) {
            console.log("🗑️ Removing object:", target);
            const elementId = target.elementId;
            canvas.remove(target);
            canvas.renderAll();
            
            // Здесь можно вызвать удаление на сервере, если нужно
            // if (elementId) deleteElement(elementId);
          }
          return;
        }

        // Рисование фигур
        if (tool !== 'pen') {
          const pointer = canvas.getPointer(opt.e);
          isDrawing = true;
          startPoint = { x: pointer.x, y: pointer.y };

          // Общие настройки для всех фигур
          const commonProps = {
            fill: 'transparent', 
            stroke: color, 
            strokeWidth: stroke,
            selectable: false, 
            evented: false,
            hasControls: false,
            hasBorders: false
          };

          if (tool === 'rectangle') {
            currentShape = new fabric.Rect({
              ...commonProps,
              left: pointer.x, top: pointer.y, width: 0, height: 0
            });
          } else if (tool === 'circle') {
            currentShape = new fabric.Ellipse({
              ...commonProps,
              left: pointer.x, top: pointer.y, rx: 0, ry: 0,
              originX: 'center', originY: 'center'
            });
          } else if (tool === 'line') {
            currentShape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
              stroke: color, strokeWidth: stroke, selectable: false, evented: false,
              hasControls: false, hasBorders: false
            });
          } else if (tool === 'text') {
            const text = new fabric.IText('', { // Пустая строка
              left: pointer.x, top: pointer.y, fontSize: 24, fill: color, selectable: true
            });
            canvas.add(text);
            canvas.setActiveObject(text);
            text.enterEditing();
            text.selectAll(); // Выделяем всё, чтобы пользователь сразу писал
            
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

      const handleResize = () => {
        canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
        canvas.renderAll();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (canvasRef.current) {
          canvasRef.current.dispose();
        }
        isInitializedRef.current = false;
      };
    };

    tryInit();
  }, [onElementAdded, readOnly]);

  // 🔑 КЛЮЧЕВОЙ ЭФФЕКТ: Управление режимом рисования и толщиной
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Режим рисования кистью ВКЛ только для pen
    canvas.isDrawingMode = (selectedTool === 'pen');
    
    if (canvas.isDrawingMode) {
      // Настраиваем существующую кисть, а не создаем новую
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.width = Number(strokeWidth); // 👈 Толщина линий
      canvas.freeDrawingBrush.color = selectedColor;       // 👈 Цвет линий
    }
    
    // Для всех остальных инструментов — ВЫКЛ
    canvas.requestRenderAll();
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
        let parsedData = el.jsonData;
        if (typeof el.jsonData === 'string') {
          parsedData = JSON.parse(el.jsonData);
        }
        objectsToLoad.push(parsedData);
      } catch (e) {
        console.error('Failed to parse element JSON', e);
      }
    });

    if (objectsToLoad.length > 0) {
      fabric.util.enlivenObjects(objectsToLoad, (objects: any[]) => {
        objects.forEach((obj, index) => {
          obj.set({ 
            selectable: false, 
            evented: false, 
            hoverCursor: 'default',
            hasControls: false,
            hasBorders: false
          });
          if (elements[index]?.id) obj.elementId = elements[index].id;
          canvas.add(obj);
        });
        
        // 👇 ГЛАВНОЕ: Принудительная перерисовка после загрузки всех объектов
        canvas.renderAll(); 
        canvas.calcOffset();
        console.log(`✅ Canvas rendered with ${objects.length} objects`);
      }, 'fabric');
    } else {
      canvas.renderAll();
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