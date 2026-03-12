import { ContextModal, ModalAction } from "./Modal";
import { ThemedText } from "../ThemedText";
import { View } from "react-native";

export default function ConfirmModal({
  modalTitle,
  message,
  visible,
  onPress,
  onClose,
  autoFocus,
}: {
  modalTitle: string;
  message: string;
  visible: boolean;
  onPress: () => void;
  onClose: () => void;
  autoFocus?: boolean;
}) {
  return (
    <ContextModal
      visible={visible}
      onClose={onClose}
      modalTitle={modalTitle}
      autoFocus={autoFocus}
    >
      <View className="px-2 mb-5">
        <ThemedText className="text-white text-lg">{message}</ThemedText>
      </View>
      <ModalAction
        label={"Confirm"}
        onPress={() => {
          onPress();
          onClose();
        }}
      />
      <ModalAction
        label="Cancel"
        hasTVPreferredFocus
        onPress={() => onClose()}
      />
    </ContextModal>
  );
}
