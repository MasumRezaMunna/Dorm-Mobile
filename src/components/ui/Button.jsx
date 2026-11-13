import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';

const SIZES = {
  sm: { py: 8,  px: 16, fontSize: 13, radius: 10 },
  md: { py: 12, px: 20, fontSize: 15, radius: 14 },
  lg: { py: 15, px: 24, fontSize: 16, radius: 16 },
};

/**
 * Button — Primary (Emerald/Mint gradient), Secondary, Outline, Danger, Ghost.
 * Theme: Premium Dark Green
 */
export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  style,
}) {
  const sz = SIZES[size] || SIZES.md;
  const isDisabled = disabled || isLoading;

  if (variant === 'primary') {
    const gradientColors = isDisabled
      ? ['#334155', '#475569']
      : ['#059669', '#10b981'];

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.82}
        style={[styles.base, { borderRadius: sz.radius }, style]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { paddingVertical: sz.py, paddingHorizontal: sz.px, borderRadius: sz.radius }]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              {Icon && <Icon size={sz.fontSize} color="#ffffff" style={{ marginRight: 8 }} />}
              <Text style={[styles.text, { fontSize: sz.fontSize, color: '#ffffff' }]}>{children}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Outline / Ghost / Secondary
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: Colors.dark.surface,
          border: Colors.dark.border,
          text: Colors.dark.text,
        };
      case 'danger':
        return {
          bg: 'rgba(244, 63, 94, 0.12)',
          border: 'rgba(244, 63, 94, 0.3)',
          text: '#f43f5e',
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: Colors.dark.textMuted,
        };
      default: // outline
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.3)',
          text: '#34d399',
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: vStyle.bg,
          borderColor: vStyle.border,
          borderWidth: 1,
          paddingVertical: sz.py,
          paddingHorizontal: sz.px,
          borderRadius: sz.radius,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={vStyle.text} />
      ) : (
        <>
          {Icon && <Icon size={sz.fontSize} color={vStyle.text} style={{ marginRight: 8 }} />}
          <Text style={[styles.text, { fontSize: sz.fontSize, color: vStyle.text }]}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '700',
  },
});
