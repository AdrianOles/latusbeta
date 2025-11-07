import { View, Text, TextInput, Keyboard } from "react-native"
import colors from "../../../colors";
import React, { useEffect } from "react";

interface Props {
    theme: 'light' | 'dark';
    title: string;
    body: string;
    changeTitle: (title: string) => void;
    changeBody: (body: string) => void;
    error: number;
    disabled: boolean;
}

const TextPhase: React.FC<Props> = ({ theme, title, body, changeTitle, changeBody, error, disabled }) => {

    return (
        <View style={{paddingBottom: 16}}>
            <TextInput
                placeholder="Announcement title"
                maxLength={45}
                keyboardType="default"
                inputMode='text'
                onFocus={() => {}}
                onChangeText={(text) => changeTitle(text)}
                value={title}
                editable={!disabled}
                returnKeyType='done'
                onSubmitEditing={Keyboard.dismiss}
                placeholderTextColor={(error === 1) ? colors.system[theme].red : colors.text[theme].tertiary}
                style={{
                    paddingBottom: 6, paddingTop: 16, borderBottomWidth: 1, borderBottomColor: colors.fills[theme].stroke,
                    color: (error === 1 && !title) ? colors.system[theme].red : colors.text[theme].primary,
                    fontSize: 24, fontFamily: 'Figtree-Bold', letterSpacing: 0, lineHeight: 32, opacity: disabled ? 0.5 : 1
                }}
            /> 
            <TextInput
                placeholder="Type your message"
                maxLength={450}
                keyboardType="default"
                inputMode='text'
                multiline
                onFocus={() => { }}
                value={body}
                onChangeText={(text) => changeBody(text)}
                editable={!disabled}
                placeholderTextColor={(error === 2) ? colors.system[theme].red : colors.text[theme].tertiary}
                style={{
                    color: (error === 2 && !body) ? colors.system[theme].red : colors.text[theme].primary, letterSpacing: 0.2,
                    fontSize: 18, fontFamily: 'Figtree-Medium', lineHeight: 32, opacity: disabled ? 0.5 : 1, minHeight: 96
                }}
            /> 
        </View>
    )
}

export default React.memo(TextPhase);