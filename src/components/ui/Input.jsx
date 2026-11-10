import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/colors';

/**
 * Styled TextInput with label, error message, and optional icon.
 */
export default function Input({
  label,
  error,
  icon: Icon,
  rightIcon,
  onRightIconPress,
  style,
  containerStyle,
  ...props
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {Icon && (
          <View style={styles.iconLeft}>
            <Icon size={16} color={Colors.dark.textMuted} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            Icon ? styles.inputWithIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={Colors.dark.textDim}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity style={styles.iconRight} onPress={onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.dark.textMuted,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputError: {
    borderColor: '#f43f5e',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.dark.text,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
  iconLeft: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 14,
    zIndex: 1,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: '#f43f5e',
  },
});
