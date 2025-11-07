import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, TextInput, Alert, Keyboard } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import colors from "../../../colors";
import Card from "./Card";

interface Props {
    theme: 'light' | 'dark';
    onChangeFile: (uri: string | null) => void;
    onChangeSize: (size: string) => void;
    onChangeType: (size: string) => void;
    valueFile: string | null;
    onChangeTitle: (title: string) => void;
    valueTitle: string;
    error: number;
}

const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes === 0) {
        return "0 Bytes";
    }

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));

    // Calculate the size in the correct unit and round to two decimal places for precision
    const sizeInUnit = sizeInBytes / Math.pow(1024, i);

    // Check if the size is already 3 digits or more
    if (sizeInUnit >= 100) {
        return `${Math.round(sizeInUnit)} ${units[i]}`;
    }

    // Format the number to have a maximum of 3 digits
    // The toPrecision method will handle rounding and significant digits
    const formattedSize = sizeInUnit.toPrecision(3);

    return `${formattedSize} ${units[i]}`;
};

const FilePhase: React.FC<Props> = ({ theme, onChangeFile, valueFile, onChangeTitle, valueTitle, onChangeSize, onChangeType, error }) => {
    const [name, setName] = useState<string>(valueTitle);
    const [fileSize, setFileSize] = useState<string>("");
    const [fileType, setFileType] = useState<string>();
    const [file, setFile] = useState<string | null>(null);
    const [sizeError, setSizeError] = useState<boolean>(false);
    const [nameError, setNameError] = useState<boolean>(false);
    const [fileError, setFileError] = useState<boolean>(false);

    useEffect(() => {
        if (error === 4) { setNameError(true); setFileError(false); }
        if (error === 5) { setFileError(true); setNameError(false); }

    }, [error])

    const clearFile = () => {
        setFile(null);
        setFileType("");
        setFileSize("");
    }
    
    const handleFilePicker = async () => {
        Keyboard.dismiss()
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain',
                    'text/csv',
                    'application/rtf',
                    'image/*'
                ],
                copyToCacheDirectory: false,
            });

            if (result.canceled) {
                console.log('Document picking cancelled.');
                return;
            }

            const asset = result.assets[0];

            // Accessing the file properties
            const fileName = asset.name;
            const fileSize = asset.size;
            const fileType = asset.mimeType;


            // Check file size (in bytes)
            const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
            if (asset.size) {
                if (asset.size > maxSizeBytes) {
                    setSizeError(true);
                    // Alert.alert("File Too Large", "Please select a file smaller than 10 MB.");
                    return;
                }
            }

            if (!valueTitle) {
                onChangeTitle(fileName)
            }
            if (fileSize && fileName && fileType) {
                setFileSize(formatFileSize(fileSize));
                onChangeSize(formatFileSize(fileSize))
                setName(fileName);
                setFileType(fileType);
                setFile(asset.uri)
                onChangeType(fileType)
            }

            onChangeFile(asset.uri);
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <TextInput
                placeholder="Name your file"
                keyboardType="default"
                inputMode="text"
                onChangeText={onChangeTitle}
                value={valueTitle}
                editable={true}
                numberOfLines={3}
                maxLength={48}
                placeholderTextColor={colors.text[theme].secondary}
                style={{
                    padding: 16, borderRadius: 16, borderWidth: 1, color: colors.text[theme].primary,
                    fontSize: 17, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.2, lineHeight: 22,
                    borderColor: nameError && !valueTitle ? colors.system[theme].red : colors.fills[theme].stroke, opacity: 1, minHeight: 56, marginBottom: 8
                }}
            />
            {(!valueFile || !file) ? (
                <>
                    <TouchableOpacity onPress={handleFilePicker} style={{
                        padding: 16, borderRadius: 16, borderWidth: 2, display: 'flex',
                        borderColor: sizeError || fileError ? colors.system[theme].red : colors.fills[theme].stroke, alignItems: 'center',
                        backgroundColor: colors.fills[theme].standard, height: 124, justifyContent: 'center'
                    }}>
                        <Ionicons name="document-outline" size={26} color={colors.text[theme].secondary} style={{  }} />
                        <Text style={{
                            color: colors.text[theme].secondary, marginTop: 4, textAlign: 'center',
                            fontSize: 17, fontFamily: 'Figtree-Medium', letterSpacing: 0.2, lineHeight: 22,
                        }}>
                            Select a file
                        </Text>
                    </TouchableOpacity>
                    {sizeError ? (
                        <Text style={{ marginTop: 8, fontFamily: "Figtree-Medium", fontSize: 13, lineHeight: 18, color: colors.system[theme].red, letterSpacing: 0.2 }}>
                            This file exceed the size limit of 10 MB.
                        </Text>
                    ) : fileError ? (
                        <Text style={{ marginTop: 8, fontFamily: "Figtree-Medium", fontSize: 13, lineHeight: 18, color: colors.system[theme].red, letterSpacing: 0.2 }}>
                            Please add a file. Maximum file size is 10MB.
                        </Text>
                    ): (
                        <Text style={{ marginTop: 8, fontFamily: "Figtree-Medium", fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, letterSpacing: 0.2 }}>
                            Any file under 10 MB
                        </Text> 
                    )}
                </>
            ): (
                <Card
                    resource={false}
                    creating={true}
                    item={{
                        name: valueTitle,
                        address: "",
                        type: fileType ? fileType : 'url',
                        size: fileSize
                    }}
                    id={""}
                    theme={theme}
                    onDelete={clearFile}
                />
            )}
        </View>
    );
};

export default FilePhase;