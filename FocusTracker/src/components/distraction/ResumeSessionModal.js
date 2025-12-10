// ==========================================
// components/distraction/ResumeSessionModal.js
// ==========================================
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { TimeFormatter } from '../../utils/timeFormatter';

export const ResumeSessionModal = ({ 
  visible, 
  timeLeft, 
  onResume, 
  onStayPaused 
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onStayPaused}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Ionicons name="pause-circle" size={64} color="#4a90e2" />
          <Text style={styles.title}>Sayaç Duraklatıldı</Text>
          <Text style={styles.subtitle}>
            Uygulamadan ayrıldığın için sayaç otomatik olarak duraklatıldı.
          </Text>
          <Text style={styles.info}>
            Kalan süre: {TimeFormatter.formatSeconds(timeLeft)}
          </Text>
          
          <View style={styles.buttons}>
            <Button
              title="Devam Et"
              icon="play"
              variant="primary"
              onPress={onResume}
              style={styles.button}
            />
            
            <Button
              title="Duraklatılmış Kalsın"
              icon="pause"
              variant="secondary"
              onPress={onStayPaused}
              style={styles.button}
            />
          </View>

          <Text style={styles.note}>
            💡 Dikkat dağınıklığı sayacına eklendi
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  info: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a90e2',
    marginBottom: 24,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
  note: {
    marginTop: 20,
    fontSize: 13,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
});