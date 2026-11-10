import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { AdPlaceholder } from "./AdBanner";
import { REAL_UNIT_IDS } from "./config";
import { loadAdsSdk } from "./sdk";
import { useAdSlot } from "./useAdSlot";

// Anúncio nativo no feed de Fotos (aparece como um cartão, com o rótulo "Anúncio"). Sem anúncio
// disponível não ocupa espaço. A "prévia" mostra só o espaço tracejado.
export function FeedNativeAd() {
  const slot = useAdSlot();
  if (slot === "off") return null;
  if (slot === "preview") return <AdPlaceholder label="Nativo" height={220} />;
  return <RealNativeAd />;
}

function RealNativeAd() {
  const { colors, fonts } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ad, setAd] = useState<any>(null);
  const sdk = loadAdsSdk();
  const { NativeAd, NativeAdView, NativeAsset, NativeAssetType, NativeMediaView, TestIds } = sdk ?? {};
  const unitId = __DEV__ ? TestIds?.NATIVE : REAL_UNIT_IDS.native;

  useEffect(() => {
    if (!NativeAd || !unitId) return;
    let loaded: { destroy?: () => void } | null = null;
    let cancelled = false;
    NativeAd.createForAdRequest(unitId)
      .then((created: { destroy?: () => void }) => {
        if (cancelled) created.destroy?.();
        else {
          loaded = created;
          setAd(created);
        }
      })
      .catch(() => undefined); // sem anúncio: nada a mostrar
    return () => {
      cancelled = true;
      loaded?.destroy?.();
    };
  }, [NativeAd, unitId]);

  if (!ad || !NativeAdView) return null;

  return (
    <NativeAdView nativeAd={ad} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        {ad.icon?.url ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: ad.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : null}
        <View style={styles.headerText}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={[styles.headline, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]} numberOfLines={1}>
              {ad.headline}
            </Text>
          </NativeAsset>
          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.mono }]}>Anúncio</Text>
        </View>
      </View>
      <NativeMediaView style={styles.media} />
      {ad.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text style={[styles.body, { color: colors.textPrimary, fontFamily: fonts.body }]} numberOfLines={2}>
            {ad.body}
          </Text>
        </NativeAsset>
      ) : null}
      {ad.callToAction ? (
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text style={[styles.cta, { color: colors.accent, fontFamily: fonts.bodyBold }]}>{ad.callToAction}</Text>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 10, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 36, height: 36, borderRadius: 8 },
  headerText: { flex: 1, gap: 2 },
  headline: { fontSize: 14 },
  label: { fontSize: 10 },
  media: { width: "100%", height: 180, borderRadius: 12 },
  body: { fontSize: 13, lineHeight: 18 },
  cta: { fontSize: 13 },
});
