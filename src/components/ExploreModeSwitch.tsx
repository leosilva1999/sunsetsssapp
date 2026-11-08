import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";

export type ExploreMode = "locations" | "cities";

interface ExploreModeSwitchProps {
  mode: ExploreMode;
  onChange: (mode: ExploreMode) => void;
}

const OPTIONS: { value: ExploreMode; label: string }[] = [
  { value: "locations", label: "Locais" },
  { value: "cities", label: "Cidades" },
];

// Alternador "Locais | Cidades" da aba Explorar.
export function ExploreModeSwitch({ mode, onChange }: ExploreModeSwitchProps) {
  const { colors, fonts } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
      {OPTIONS.map((option) => {
        const active = option.value === mode;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, active && { backgroundColor: colors.textPrimary }]}
          >
            <Text style={[styles.label, { color: active ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", borderRadius: 999, padding: 4, alignSelf: "flex-start" },
  option: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
  label: { fontSize: 13 },
});
