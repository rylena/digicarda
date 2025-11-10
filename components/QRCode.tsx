import React from "react";
import QRCode from "react-qr-code";

export interface QRCodeComponentProps {
  url: string;
  size: number;
  fgColor?: string;
  bgColor?: string;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({
  url,
  size,
  fgColor = "#000000",
  bgColor = "#ffffff",
}) => {
  return (
    <QRCode
      value={url}
      size={size}
      fgColor={fgColor}
      bgColor={bgColor}
    />
  );
};

export default QRCodeComponent;
