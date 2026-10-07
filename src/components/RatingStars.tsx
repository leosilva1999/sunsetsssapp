import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";

interface RatingStarsProps {
  value: number;
  size?: number;
  /** Presente = picker interativo (tocar numa estrela define a nota); ausente = só exibição. */
  onChange?: (score: number) => void;
}

const STAR_SCORES = [1, 2, 3, 4, 5] as const;

export function RatingStars({ value, size = 18, onChange }: RatingStarsProps) {
  const { sunIconColor, colors } = useTheme();

  return (
    <View style={styles.row}>
      {STAR_SCORES.map((score) =>
        onChange ? (
          <Pressable key={score} onPress={() => onChange(score)} hitSlop={4}>
            <Ionicons
              name={score <= value ? "star" : "star-outline"}
              size={size}
              color={score <= value ? sunIconColor : colors.textSecondary}
            />
          </Pressable>
        ) : (
          <Ionicons
            key={score}
            name={score <= value ? "star" : "star-outline"}
            size={size}
            color={score <= value ? sunIconColor : colors.textSecondary}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 2 },
});
