import { View, Text, Pressable, Keyboard, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from "../../colors";
import { useAuthContext } from "../../contexts/AuthContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FilePhase from "../Resources/components/FilePhase";
import { useState } from "react";
import { HomeStackParamList } from "../../navigation";

type AddFileRouteProp = RouteProp<HomeStackParamList, 'AddFile'>;

export type FileData = {
    title: string,
    file: string,
    fileSize: string,
    fileType: string
}

const AddFile = () => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const route = useRoute<AddFileRouteProp>();
    const { fileChange } = route.params;
    const [title, setTitle] = useState<string>("");
    const [file, setFile] = useState<string | null>(null);
    const [fileSize, setFileSize] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorState, setError] = useState<number>(0);

    const handleAttach = () => {
        if (file && title && fileSize && fileType) {
            
            const fileData: FileData = {
                title: title,
                file: file,
                fileSize: fileSize,
                fileType: fileType,
            };

            // Call the callback function from the parent screen
            if (file) {
                fileChange(fileData);
            }

            // Navigate back to the previous screen
            navigation.goBack();
        } else if (!file) {
            setError(5);
        }
    };

    return (
        <Pressable onPress={() => Keyboard.dismiss()} style={{
            height: '100%', backgroundColor: colors.background[theme].elevated,
            paddingTop: Platform.OS === 'android' ? 24 : 0
        }}>
            <Pressable onPress={() => Keyboard.dismiss()} style={{ height: 60, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'center', marginLeft: 'auto', }}>
                    <Ionicons
                        name="close-outline" size={26}
                        color={colors.text[theme].primary}
                        style={{
                            backgroundColor: colors.fills[theme].standard,
                            borderRadius: 250, padding: 4
                        }}
                    />
                </TouchableOpacity>
            </Pressable>

            <Pressable onPress={() => Keyboard.dismiss()} style={{ alignItems: 'center', marginBottom: 24 }}>
                <Ionicons name="document-text-outline" size={54} style={{ padding: 16 }} color={colors.text[theme].primary} />
                <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 22, lineHeight: 28, color: colors.text[theme].primary }}>Attach a file</Text>
                <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>Any size under 10 MB</Text>
            </Pressable>

            <FilePhase
                theme={theme}
                onChangeFile={(file) => setFile(file)}
                valueFile={file}
                onChangeTitle={(title) => setTitle(title)}
                valueTitle={title}
                onChangeSize={(size) => setFileSize(size)}
                onChangeType={(type) => setFileType(type)}
                error={errorState}          
            />

            <View style={{
                padding: 16, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.fills[theme].stroke,
                display: 'flex', flexDirection: 'row', marginTop: 'auto'
            }}>
                <TouchableOpacity onPress={() => handleAttach()} style={{
                    flexGrow: 1, padding: 24, borderRadius: 250, backgroundColor: colors.text[theme].primary,
                }}>
                    <Text style={{ color: colors.background[theme].general, textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
                        Attach
                    </Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    )
}

export default AddFile;