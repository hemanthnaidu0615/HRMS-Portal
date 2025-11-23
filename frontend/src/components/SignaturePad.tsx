import { useRef, useEffect, useState } from 'react';
import { Button, Space, Card } from 'antd';
import { ClearOutlined, UndoOutlined, CheckOutlined } from '@ant-design/icons';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  width = 500,
  height = 200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);

        // Set canvas background to white
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;

    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    context.lineTo(x, y);
    context.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    if (!context || !canvasRef.current) return;

    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
  };

  const save = () => {
    if (!canvasRef.current || !hasDrawn) return;

    const signatureData = canvasRef.current.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <div style={{
          border: '2px dashed #d9d9d9',
          borderRadius: 8,
          padding: 16,
          background: '#fafafa',
          textAlign: 'center'
        }}>
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              cursor: 'crosshair',
              background: '#fff',
              touchAction: 'none',
            }}
          />
          <div style={{ marginTop: 12, color: '#999', fontSize: 14 }}>
            Draw your signature above
          </div>
        </div>

        <Space>
          <Button
            icon={<ClearOutlined />}
            onClick={clear}
            disabled={!hasDrawn}
          >
            Clear
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={save}
            disabled={!hasDrawn}
            style={{
              background: '#52c41a',
              borderColor: '#52c41a',
            }}
          >
            Save Signature
          </Button>
        </Space>
      </Space>
    </Card>
  );
};
