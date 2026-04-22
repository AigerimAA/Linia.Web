import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface CanvasProps {
  onElementAdded: (element: any) => void;
  readOnly?: boolean;
  selectedTool?: string;
  selectedColor?: string;
  strokeWidth?: number;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  onElementAdded, 
  readOnly = false,
  selectedTool = 'pen',
  selectedColor = '#000000',
  strokeWidth = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ffffff',
      selection: !readOnly,
    });

    fabricCanvasRef.current = canvas;

    let panning = false;
    let lastX = 0;
    let lastY = 0;
    let isDrawing = false;
    let currentShape: any = null;
    let startPoint: { x: number; y: number } = { x: 0, y: 0 };

    canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.1) zoom = 0.1;
      canvas.zoomToPoint(new fabric.Point(opt.e.offsetX, opt.e.offsetY), zoom);
      opt.e.preventDefault();
    });

    canvas.on('mouse:down', (opt: any) => {
      const pointer = canvas.getPointer(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      if (opt.e.button === 1 || opt.e.shiftKey) {
        panning = true;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        canvas.selection = false;
        opt.e.preventDefault();
      } else if (opt.e.button === 0 && !readOnly) {
        isDrawing = true;
        startPoint = { x, y };

        if (selectedTool === 'rectangle') {
          currentShape = new fabric.Rect({
            left: x,
            top: y,
            width: 0,
            height: 0,
            fill: 'transparent',
            stroke: selectedColor,
            strokeWidth: strokeWidth,
            selectable: false,
            evented: false,
          });
          canvas.add(currentShape);
        } else if (selectedTool === 'circle') {
          currentShape = new fabric.Ellipse({
            left: x,
            top: y,
            rx: 0,
            ry: 0,
            fill: 'transparent',
            stroke: selectedColor,
            strokeWidth: strokeWidth,
            selectable: false,
            evented: false,
          });
          canvas.add(currentShape);
        } else if (selectedTool === 'line') {
          currentShape = new fabric.Line([x, y, x, y], {
            stroke: selectedColor,
            strokeWidth: strokeWidth,
            selectable: false,
            evented: false,
          });
          canvas.add(currentShape);
        } else if (selectedTool === 'pen') {
          currentShape = new fabric.Path(`M ${x} ${y}`, {
            stroke: selectedColor,
            strokeWidth: strokeWidth,
            fill: '',
            selectable: false,
            evented: false,
          });
          canvas.add(currentShape);
        }
      }
    });

    canvas.on('mouse:move', (opt: any) => {
      const pointer = canvas.getPointer(opt.e);
      const x = pointer.x;
      const y = pointer.y;

      if (panning && opt.e) {
        const dx = opt.e.clientX - lastX;
        const dy = opt.e.clientY - lastY;
        canvas.relativePan(new fabric.Point(dx, dy));
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
      } else if (isDrawing && currentShape) {
        if (selectedTool === 'rectangle') {
          currentShape.set({
            width: Math.abs(x - startPoint.x),
            height: Math.abs(y - startPoint.y),
            left: Math.min(startPoint.x, x),
            top: Math.min(startPoint.y, y),
          });
        } else if (selectedTool === 'circle') {
          const rx = Math.abs(x - startPoint.x) / 2;
          const ry = Math.abs(y - startPoint.y) / 2;
          currentShape.set({
            rx: rx,
            ry: ry,
            left: startPoint.x + (x - startPoint.x) / 2,
            top: startPoint.y + (y - startPoint.y) / 2,
          });
        } else if (selectedTool === 'line') {
          currentShape.set({ x2: x, y2: y });
        } else if (selectedTool === 'pen') {
          const pathData = currentShape.path;
          pathData.push(['L', x, y]);
          currentShape.set({ path: pathData });
        }
        canvas.renderAll();
      }
    });

    canvas.on('mouse:up', () => {
      if (isDrawing && currentShape) {
        onElementAdded(currentShape);
        currentShape = null;
      }
      panning = false;
      isDrawing = false;
      canvas.selection = true;
    });

    const handleResize = () => {
      canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
      canvas.renderAll();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, [readOnly, selectedTool, selectedColor, strokeWidth, onElementAdded]);

  return (
    <canvas
      id="drawing-canvas"
      ref={canvasRef}
      style={{ display: 'block', position: 'fixed', top: 0, left: 0 }}
    />
  );
};