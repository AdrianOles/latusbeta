import { View, Text, Pressable, Keyboard, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import colors from "../../colors";
import { useAuthContext } from "../../contexts/AuthContext";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FilePhase from "../Resources/components/FilePhase";
import { useState } from "react";
import LinkPhase from "../Resources/components/LinkPhase";
import { HomeStackParamList } from "../../navigation";

type AddLinkRouteProp = RouteProp<HomeStackParamList, 'AddLink'>;

export type LinkData = {
    link: string,
    title: string
}

const checkLink = async (link: string): Promise<string | boolean> => {
    let checkThis = link;
    if (!link.startsWith('https://')) {
        checkThis = `https://${link}`;
    }
    try {
        const canOpen = await Linking.canOpenURL(checkThis);
        if (!canOpen) return false
    } catch (e) {
        console.log(e)
    }

    try {
        const response = await fetch(checkThis, { method: 'HEAD' });
        if (response.ok) {
            // Check for potential redirects or unwanted content types
            const contentType = response.headers.get('Content-Type');
            const location = response.headers.get('Location');

            if (location) {
                return false
            } else if (contentType && contentType.includes('text/html')) {
                return checkThis;
            } else {
                return false
            }
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const AddLink = () => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();
    const route = useRoute<AddLinkRouteProp>();
    const { linkChange } = route.params;
    const [title, setTitle] = useState<string>("");
    const [link, setLink] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [errorState, setError] = useState<number>(0);

    const handleAttach = async () => {
        setLoading(true);
        if (link && title) {
            if (await checkLink(link)) {
                const linkObject: LinkData = {
                    title: title,
                    link: link
                }

                linkChange(linkObject);
                navigation.goBack();
            } else {
                setError(3);
            }
        } else if (!link) {
            setError(1);
        } else if (!title) {
            setError(2);
        }
        setLoading(false);
    };

    return (
        <View style={{height: '100%', backgroundColor: colors.background[theme].elevated}}>
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
                <Ionicons name="globe-outline" size={54} style={{ padding: 16 }} color={colors.text[theme].primary} />
                <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 22, lineHeight: 28, color: colors.text[theme].primary }}>Attach a link</Text>
                <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>Where do you want to take us?</Text>
            </Pressable>

            <LinkPhase
                theme={theme}
                onChangeLink={(link) => setLink(link)}
                valueLink={link}
                onChangeTitle={(title) => setTitle(title)}
                valueTitle={title}
                error={errorState}
                placeHolder={"Title your link"}
                onValid={() => {}}
            />

            <Pressable onPress={() => Keyboard.dismiss()} style={{height: 'auto', width: '100%', flexGrow: 1}} />

            <Pressable onPress={() => Keyboard.dismiss()} style={{
                padding: 16, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.fills[theme].stroke,
                display: 'flex', flexDirection: 'row', marginTop: 'auto'
            }}>
                <TouchableOpacity disabled={loading} onPress={handleAttach} style={{
                    flexGrow: 1, padding: 24, borderRadius: 250, backgroundColor: colors.text[theme].primary,
                    opacity: loading ? 0.5 : 1
                }}>
                    {loading && (
                        <ActivityIndicator />
                    )}
                    {!loading && (
                        <Text style={{ color: colors.background[theme].general, textAlign: 'center', fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20 }}>
                            Attach
                        </Text>
                    )}
                </TouchableOpacity>
            </Pressable>
        </View>
    )
}

export default AddLink;