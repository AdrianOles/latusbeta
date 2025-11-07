import { TouchableOpacity, View, Text, Pressable, Keyboard, Image } from "react-native";
import ProfileGen from "../../../components/ProfileGen";
import { AuthUserCustomType } from "../../../contexts/AuthContext";
import { HomeStackParamList } from "../../../navigation";
import React from "react";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';

interface Props {
    theme: 'light' | 'dark';
    authUser: AuthUserCustomType;
    navigation: HomeStackParamList;
    disabled: boolean;
}

const CHeader: React.FC<Props> = ({ theme, authUser, navigation, disabled }) => {
    return (
        <Pressable onPress={() => Keyboard.dismiss()} style={{
            flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8,
            borderBottomWidth: 1, borderColor: colors.fills[theme].stroke
        }}>
            <Image
                width={38}
                height={38}
                source={{ uri: authUser.picture }}
                style={{borderRadius: 250}}
            />
            <Text numberOfLines={1} style={{
                fontSize: 17, lineHeight: 22, fontFamily: 'Figtree-SemiBold', color: colors.text[theme].primary,
                flexShrink: 1, marginLeft: 8
            }}>
                {authUser.name}
            </Text>

            <TouchableOpacity
                onPress={() => navigation.goBack()}
                disabled={disabled}
                style={{
                    backgroundColor: colors.fills[theme].standard, borderRadius: 250, width: 36, aspectRatio: 1, justifyContent: 'center',
                    marginLeft: 'auto', opacity: disabled ? 0.5 : 1
                 }}
            >
                <Ionicons size={24} name='close' style={{ alignSelf: 'center' }} color={colors.text[theme].primary} />
            </TouchableOpacity>
        </Pressable>
    )
}

export default CHeader;