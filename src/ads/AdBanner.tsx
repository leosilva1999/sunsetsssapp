import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { REAL_UNIT_IDS } from "./config";
import { loadAdsSdk } from "./sdk";
import { useAdSlot } from "./useAdSlot";

// Banner adaptativo. Sem anúncio disponível (modo "off", falha de carregamento, sem ID de unidade) o
// componente não ocupa espaço nenhum. A "prévia" mostra um retângulo tracejado, só pra ver o layout.
export function AdBanner() {
  const slot = useAdSlot();
  if (slot === "off") return null;
  if (slot === "preview") return <AdPlaceholder label="Banner" height={60} />;
  return <RealBanner />;
}

function RealBanner() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const sdk = loadAdsSdk();
  const { BannerAd, BannerAdSize, TestIds } = sdk ?? {};
  // Desenvolvimento = sempre ID de teste; produção = ID real (sem ele, não mostra nada).
  const unitId = __DEV__ ? TestIds?.ADAPTIVE_BANNER : REAL_UNIT_IDS.banner;
  if (!BannerAd || !unitId || failed) return null;

  return (
    // O banner precisa estar montado pra carregar; fica sem altura até o anúncio chegar.
    <View style={loaded ? styles.bannerLoaded : styles.bannerHidden}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

export function AdPlaceholder({ label, height }: { label: string; height: number }) {
  const { colors, fonts } = useTheme();
  return (
    <View style={[styles.placeholder, { height, borderColor: colors.textSecondary }]}>
      <Text style={[styles.placeholderText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
        Anúncio · {label} (prévia)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerLoaded: { alignItems: "center" },
  bannerHidden: { height: 0, overflow: "hidden" },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    opacity: 0.7,
  },
  placeholderText: { fontSize: 11 },
});
