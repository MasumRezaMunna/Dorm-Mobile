import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Reusable Button component.
 *
 * Variants:
 *  - "primary"  : Purple→Blue gradient (default)
 *  - "danger"   : Red gradient
 *  - "ghost"    : Transparent with border
 *  - "outline"  : White border
 */
export default function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  style,
}) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 8,  paddingHorizontal: 16, borderRadius: 10, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, fontSize: 15 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, fontSize: 16 },
  };

  const sz = sizeStyles[size] || sizeStyles.md;

  if (variant === 'primary' || variant === 'danger') {
    const colors = variant === 'danger'
      ? ['#f43f5e', '#dc2626']
      : ['#7c3aed', '#2563eb'];

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[{ opacity: isDisabled ? 0.55 : 1, borderRadius: sz.borderRadius }, style]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.base,
            { paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal, borderRadius: sz.borderRadius },
          ]}
        >
          {loading
            ? <ActivityIndicator size="small" color="#ffffff" />
            : <>
                {Icon && <Icon size={sz.fontSize} color="#fff" style={{ marginRight: 8 }} />}
                <Text style={[styles.text, { fontSize: sz.fontSize }]}>{children}</Text>
              </>
          }
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Ghost / Outline variants
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        styles.ghost,
        {
          paddingVertical: sz.paddingVertical,
          paddingHorizontal: sz.paddingHorizontal,
          borderRadius: sz.borderRadius,
          opacity: isDisabled ? 0.55 : 1,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: 'rgba(255,255,255,0.2)',
        },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color="#a78bfa" />
        : <>
            {Icon && <Icon size={sz.fontSize} color="#a78bfa" style={{ marginRight: 8 }} />}
            <Text style={[styles.text, { fontSize: sz.fontSize, color: '#a78bfa' }]}>{children}</Text>
          </>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
