import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export default function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              onPress={onBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.backBtn,
                { backgroundColor: colors.glassLight, borderColor: colors.glassBorder, borderWidth: 1 },
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            {!!title && (
              <Text numberOfLines={1} style={[styles.title, { color: colors.textPrimary }]}>
                {title}
              </Text>
            )}
            {!!subtitle && (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {!!rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.rightBtn, { backgroundColor: colors.primarySoft }]}
          >
            <Ionicons name={rightIcon} size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rightBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
