import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from "../../../colors";

interface Props {
    theme: 'light' | 'dark';
    setSelection: (select: "file" | "link" | null) => void;
    selection: "link" | "file" | null;
}

const SelectionPhase: React.FC<Props> = ({theme, setSelection, selection}) => {
    return (
        <View style={{}}>
            <TouchableOpacity onPress={() => setSelection("link")} style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', width: 240, marginHorizontal: 'auto',
                padding: 18, borderRadius: 250, borderWidth: 2, borderColor: selection === 'link' ? colors.system[theme].blue : colors.fills[theme].stroke, marginBottom: 16
            }}>
                <Ionicons name="globe-outline" size={24} style={{ marginRight: 10 }} color={selection === 'link' ? colors.system[theme].blue : colors.text[theme].secondary} />
                <Text style={{ color: selection === 'link' ? colors.system[theme].blue : colors.text[theme].secondary, fontFamily: "Figtree-SemiBold", fontSize: 17, lineHeight: 22 }}>Link</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelection("file")} style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', width: 240, marginHorizontal: 'auto',
                padding: 18, borderRadius: 250, borderWidth: 2, borderColor: selection === 'file' ? colors.system[theme].blue : colors.fills[theme].stroke
            }}>
                <Ionicons name="document-outline" size={24} style={{ marginRight: 10 }} color={selection === 'file' ? colors.system[theme].blue : colors.text[theme].secondary} />
                <Text style={{ color: selection === 'file' ? colors.system[theme].blue : colors.text[theme].secondary, fontFamily: "Figtree-SemiBold", fontSize: 17, lineHeight: 22 }}>File</Text>
            </TouchableOpacity>
        </View>
    )
}

export default SelectionPhase;