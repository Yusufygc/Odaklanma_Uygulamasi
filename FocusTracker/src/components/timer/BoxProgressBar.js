// ==========================================
// components/timer/BoxProgressBar.js
// ==========================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

export const BoxProgressBar = ({ 
  progress, 
  width, 
  height, 
  borderRadius = 20, 
  color = '#4a90e2', 
  strokeWidth = 5 
}) => {
  // Boyutlar henüz hesaplanmadıysa çizme
  if (width === 0 || height === 0) return null;

  // Çerçevenin toplam uzunluğunu (çevresini) hesapla
  // Formül: Düz kenarlar + Köşe yayları (2*pi*r)
  const r = borderRadius;
  const w = width;
  const h = height;
  
  // Eğer köşe yarıçapı çok büyükse matematiksel hata olmaması için sınırla
  const validRadius = Math.min(r, w/2, h/2);
  
  const perimeter = 2 * (w - 2 * validRadius) + 2 * (h - 2 * validRadius) + 2 * Math.PI * validRadius;
  
  // İlerlemeye göre ne kadarının boş kalacağını hesapla
  // progress %100 ise offset 0 olur (tam dolu)
  // progress %0 ise offset perimeter kadar olur (tam boş)
  const strokeDashoffset = perimeter * (1 - progress / 100);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={w} height={h}>
        {/* Arkaplan Çizgisi (Soluk Gri) - Opsiyonel, şık durur */}
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={w - strokeWidth}
          height={h - strokeWidth}
          rx={validRadius}
          ry={validRadius}
          stroke={color}
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* İlerleme Çizgisi (Renkli) */}
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          width={w - strokeWidth}
          height={h - strokeWidth}
          rx={validRadius}
          ry={validRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={perimeter}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          // Animasyonun tepeden başlaması için biraz döndürme ayarı gerekebilir
          // ancak Rect default olarak sol-üstten başlar. 
          // Timer hissi için bu genellikle kabul edilir.
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // Kutunun üzerine tam otur
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // İçeriğin arkasında değil, çerçeve olduğu için üstte de olabilir ama tıklamayı engellememeli
  },
});