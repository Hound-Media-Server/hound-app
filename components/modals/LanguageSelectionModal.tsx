import { getName } from "@cospired/i18n-iso-languages";
import { FlatList, View } from "react-native";
import { ContextModal, ModalAction } from "./Modal";
import { useRef } from "react";

export default function LanguageSelectionModal({
  modalTitle,
  visible,
  onClose,
  lang,
  setLang,
  showOriginalLang = false,
}: {
  modalTitle?: string;
  visible: boolean;
  onClose: () => void;
  lang?: string;
  setLang: (language: string) => void;
  showOriginalLang?: boolean;
}) {
  const flatListRef = useRef<FlatList>(null);

  // curated list for now
  let supportedLanguages = [
    "en",
    "ar",
    "de",
    "es",
    "fr",
    "hu",
    "id",
    "it",
    "ja",
    "ko",
    "nl",
    "pl",
    "pt",
    "ro",
    "ru",
    "sk",
    "sv",
    "th",
    "uk",
    "vi",
    "zh",
  ];
  if (showOriginalLang) {
    supportedLanguages = ["original", ...supportedLanguages];
  }

  const initialScrollIndex = lang ? supportedLanguages.indexOf(lang) : -1;

  return (
    <ContextModal
      visible={visible}
      onClose={onClose}
      modalTitle={modalTitle || "Select Language"}
      autoFocus={true}
    >
      <View style={{ flexShrink: 1 }}>
        <FlatList
          ref={flatListRef}
          className="group"
          data={supportedLanguages}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={
            initialScrollIndex !== -1 ? initialScrollIndex : undefined
          }
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
                viewPosition: 0.5,
              });
            }, 100);
          }}
          renderItem={({ item, index }) => (
            <ModalAction
              label={getName(item, "en") || "Original Language"}
              onPress={() => {
                setLang(item);
                onClose();
              }}
              onFocus={() => {
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.5,
                });
              }}
              hasTVPreferredFocus={item === lang}
            />
          )}
        />
      </View>
    </ContextModal>
  );
}
