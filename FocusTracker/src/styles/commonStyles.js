// ==========================================
// styles/commonStyles.js
// ==========================================
import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from './index';

export const CommonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: Spacing.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },

  // Text
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textLight,
  },

  // Buttons
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.border,
  },
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
  },

  // Spacing
  marginBottomSm: { marginBottom: Spacing.sm },
  marginBottomMd: { marginBottom: Spacing.md },
  marginBottomLg: { marginBottom: Spacing.lg },
  paddingSm: { padding: Spacing.sm },
  paddingMd: { padding: Spacing.md },
  paddingLg: { padding: Spacing.lg },

  // Flex
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});