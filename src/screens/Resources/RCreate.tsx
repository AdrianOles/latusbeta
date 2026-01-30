import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, Pressable, KeyboardAvoidingView, Platform, Keyboard, Dimensions, ActivityIndicator, Linking, Alert } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { useAuthContext } from '../../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { generateClient, GraphQLQuery } from 'aws-amplify/api';
import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import ModalButton from '../../components/ModalButton';
import * as Network from 'expo-network';
import { CreateResourceInput, CreateResourceMutation, Resource, ResourcesBySchoolAndBoardQuery, UpdateResourceInput, UpdateResourceMutation } from '../../API';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import colors from '../../colors';
import { HomeStackParamList } from '../../navigation';
import ModalFooter from '../../components/ModalFooter';
import { StatusBar } from 'expo-status-bar';

type IconName = "wallet" | "leaf" | "paper-plane" | "accessibility" | "library";
type iconColors = "#A67E50" | "#22BFA0" | "#0080FF" | "#AD4AD4" | "#E0267D" | "#FFFFFFAA";
type ModalScreenRouteProp = RouteProp<HomeStackParamList, 'RCreateScreen'>;

const iconOrder: IconName[] = ["wallet", "leaf", "paper-plane", "accessibility", "library"];
const iconColorOrder: iconColors[] = ["#A67E50", "#22BFA0", "#0080FF", "#AD4AD4", "#E0267D"];
const client = generateClient();

const Rcreate = () => {
    const navigation = useNavigation<HomeStackParamList>();
    const { authUser, theme } = useAuthContext();
    const route = useRoute<ModalScreenRouteProp>();
    const { id, defaultTitle, defaultIcon, defaultIconColor, defaultLink } = route.params;
    const [formErrors, setFormErrors] = useState({
        any: false,
        title: false,
        color: false,
        link: false,
    })
    const [creationLoading, setCreationLoading] = useState(false);
    const { cache } = useSWRConfig();
    const [editing, setEditing] = useState<boolean>(false);
    const [linkError, setLinkError] = useState(false);

    useEffect(() => {
        if (defaultTitle || defaultIcon || defaultIconColor || defaultLink) {
            setEditing(true);
        } else {
            setEditing(false);
        }
    }, [route.params])

    const IconSelect = () => {
        return (
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 8, opacity: creationLoading ? 0.5 : 1 }}>
                {
                    iconOrder.map((iconType, index) => (
                        <TouchableOpacity disabled={creationLoading} key={index} onPress={() => setCustomValue("icon", iconType)} style={{ flexGrow: 1, aspectRatio: 1, borderRadius: 250, padding: 6, borderColor: icon === iconType ? colors.text[theme].primary : colors.fills[theme].stroke, borderWidth: 2, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name={iconType} size={24} color={colors.text[theme].primary}></Ionicons>
                        </TouchableOpacity>
                    ))
                }
            </View>
        )
    }

    const ColorSelect = () => {
        return (
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginBottom: 8, opacity: creationLoading ? 0.5 : 1 }}>
                {
                    iconColorOrder.map((color, index) => (
                        <TouchableOpacity disabled={creationLoading} key={index} onPress={() => setCustomValue("iconColor", color)} style={{
                            flexGrow: 1, aspectRatio: 1, borderRadius: 250, padding: 6, borderWidth: 2, position: 'relative',
                            borderColor: (formErrors.color && !iconColor) ? colors.system[theme].red : iconColor === color ? colors.text[theme].primary : colors.fills[theme].stroke
                        }}>
                            <View style={{ width: 'auto', backgroundColor: color, aspectRatio: 1, borderRadius: 250 }}></View>
                        </TouchableOpacity>
                    ))
                }
            </View>
        )
    }

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: {
            errors,
        },
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            icon: defaultIcon ? defaultIcon : 'paper-plane',
            iconColor: defaultIconColor ? defaultIconColor : '#0080FF',
            link: defaultLink ? defaultLink : '',
            title: defaultTitle ? defaultTitle : '',
        }
    });

    const title = watch('title');
    const iconColor = watch('iconColor');
    const link = watch('link');
    const icon = watch('icon');

    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        })
    }

    const handleClose = () => {
        if (!creationLoading) {
            reset();
            setValue('title', null);
            setValue('link', null);
            setValue('iconColor', null)
            setValue('icon', null)
            navigation.goBack()
        }
    }

    const fetchResources = async () => {
        console.log("Fetching from r create side")
        const result = await client.graphql<GraphQLQuery<ResourcesBySchoolAndBoardQuery>>({
            query: queries.resourcesBySchoolAndBoard,
            variables: {
                schoolAndBoard: authUser?.school + "+" + "hcdsb",
            }
        })

        console.log(result);

        const allResources = result?.data?.resourcesBySchoolAndBoard?.items;

        return allResources;
    }

    const { data, error }: SWRResponse = useSWR('resources', fetchResources, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 600000, // 1 minute (or set to your desired interval)
    })

    const createResource = async (resourceDetails: CreateResourceInput) => {
        const { errors, data: newResource } = await client.graphql<GraphQLQuery<CreateResourceMutation>>({
            query: mutations.createResource,
            variables: {
                input: {
                    ...resourceDetails
                }
            }
        })

        if (!errors) {
            Toast.show({
                type: 'success',
                topOffset: 0
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else {
            Toast.show({
                type: 'error',
                topOffset: 0
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        }
        return newResource;
    }

    const editResource = async (resourceDetails: CreateResourceInput) => {
        if (id && authUser && resourceDetails.editorname) {
            const editDetails: UpdateResourceInput = {
                ...resourceDetails,
                id: id,
                schoolAndBoard: authUser.school + "+" + "hcdsb",
            }

            const result = await client.graphql<GraphQLQuery<UpdateResourceMutation>>({
                query: mutations.updateResource,
                variables: {
                    input: editDetails
                }
            })

            console.log("Edit result");
            console.log(result)

            if (!result.errors) {
                Toast.show({
                    type: 'success',
                    topOffset: 0
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            } else {
                Toast.show({
                    type: 'error',
                    topOffset: 0
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            }

            return result.data.updateResource;
        }
    }

    const checkNetwork = async () => {
        const response = await Network.getNetworkStateAsync();

        if (response?.isConnected && response?.isInternetReachable) {
            return true;
        } else {
            Toast.show({
                type: 'error',
                topOffset: 0
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            return false;
        }
    }

    const checkLink = async (link: string) => {
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
                    return true;
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

    const { mutate } = useSWRConfig();

    const onSubmit = async () => {
        if (!link) setFormErrors({ ...formErrors, link: true, any: true })
        if (!iconColor) setFormErrors({ ...formErrors, color: true, any: true })
        if (!title) setFormErrors({ ...formErrors, title: true, any: true })
        if (link && iconColor && title && icon) setFormErrors({ ...formErrors, title: false, any: false, color: false, link: false })

        if (link && iconColor && title && icon && authUser) {
            setCreationLoading(true);
            if (await checkLink(link)) {
                let checkThis = link;
                if (!link.startsWith('https://')) {
                    checkThis = `https://${link}`;
                }

                const resourceDetails: CreateResourceInput = {
                    schoolAndBoard: authUser.school + "+" + "hcdsb",
                    authorName: authUser.email,
                    authorId: authUser.email,
                    authorPicture: "picture",
                    authorRole: authUser.staffRole,
                    editType: ["create"],
                    editorId: [authUser.email],
                    editTime: [new Date().toString()],
                    editorname: [authUser.email],
                    id: uuidv4(),
                    content: {
                        name: title,
                        address: checkThis,
                        type: 'link',
                        size: undefined
                    }
                }

                console.log("Object: ", resourceDetails);

                const networkResult = await checkNetwork();

                try {
                    if (resourceDetails && authUser && !editing && networkResult) {
                        const newResource = resourceDetails;
                        const resources = [...data, newResource]
                        const options = {
                            optimisticData: resources,
                            rollbackOnError(error: any) {
                                // If it's timeout abort error, don't rollback
                                return error.name !== 'AbortError'
                            },
                        }
                        // console.log("Creating it.");
                        mutate('resources', createResource(resourceDetails), options);
                    }

                    if (resourceDetails && authUser && editing && id && networkResult) {
                        const updatedResources = data.map((resource: { id: any; }) =>
                            resource.id === id ? resourceDetails : resource
                        );

                        const options = {
                            optimisticData: updatedResources,
                            rollbackOnError(error: any) {
                                // If it's a timeout abort error, don't rollback
                                return error.name !== 'AbortError';
                            },
                        };
                        console.log("editResource mutate:")
                        mutate('resources', editResource(resourceDetails), options);
                    }
                } catch (err) {
                    console.log(err);
                } finally {
                    setTimeout(() => {
                        setCreationLoading(false);
                        handleClose();
                    }, 200)
                }
            } else {
                setCreationLoading(false);
                setLinkError(true);
            }
        }
    }

    let content = (
        <>
            <View style={{
                backgroundColor: theme === 'dark' ? "#FFFFFF0D" : '#0000000D', borderRadius: 250, width: 80, aspectRatio: 1,
                marginHorizontal: 'auto', marginBottom: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', marginVertical: 32,
            }}>
                <Ionicons name={icon} size={46} color={iconColor ? iconColor : colors.text[theme].primary}></Ionicons>
            </View>

            {/* Name input */}
            <Controller
                control={control}
                rules={{
                    required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder="Name your resource"
                        keyboardType="default"
                        placeholderTextColor={colors.text[theme].secondary}
                        onBlur={onBlur}
                        maxLength={45}
                        onChangeText={onChange}
                        value={value}
                        editable={!creationLoading}
                        style={{
                            padding: 16, borderRadius: 16, backgroundColor: theme === 'dark' ? '#FFFFFF1F' : '#0000001A', borderWidth: 1, color: colors.text[theme].primary, borderColor: (formErrors.title && !title) ? colors.system[theme].red : '#FFFFFF00',
                            fontSize: 17, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.2, lineHeight: 22, textAlign: 'center', opacity: creationLoading ? 0.5 : 1
                        }}
                    />
                )}
                name='title'
            ></Controller>

            {/* Icon input */}
            <IconSelect />
            {/* Color input */}
            <ColorSelect />

            {/* Link */}
            <View>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder="Paste your link"
                            keyboardType="default"
                            inputMode="url"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            editable={!creationLoading}
                            placeholderTextColor={colors.text[theme].secondary}
                            style={{
                                padding: 16, borderRadius: 16, backgroundColor: theme === 'dark' ? '#FFFFFF1F' : '#0000001A', borderWidth: 1, color: colors.text[theme].primary,
                                fontSize: 17, fontFamily: 'Figtree-Medium', letterSpacing: 0.2, lineHeight: 22,
                                borderColor: (formErrors.link && !link) || linkError ? colors.system[theme].red : '#FFFFFF00', opacity: creationLoading ? 0.5 : 1
                            }}
                        />
                    )}
                    name='link'
                ></Controller>

                {
                    linkError && (
                        <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, letterSpacing: 0.2, color: '#FA3E42', paddingLeft: 16, paddingTop: 4 }}>
                            Please add a valid link
                        </Text>
                    )
                }
            </View>
        </>
    )

    return (
        <View
            style={{ flex: 1, backgroundColor: colors.background[theme].general, paddingTop: 60 }}
        >
            <Pressable
                style={{ flex: 1, backgroundColor: colors.background[theme].elevated }}
                onPress={Keyboard.dismiss}
            >
                <View style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingBottom: 100, // give space for the footer
                            flexGrow: 1,
                            gap: 16,
                        }}
                    >
                        {content}
                    </ScrollView>
                </View>

                {/* Fixed footer */}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <ModalFooter unique={false} label={title?.length === 45 ? 'Maximum title character count reached' : null}>
                        <View style={{ marginHorizontal: 16, flexGrow: 1 }}>
                            <ModalButton
                                state={'proceed'}
                                disabled={creationLoading}
                                onPress={onSubmit}
                                label={editing ? 'Update' : 'Create'}
                                loadingIndicator={true}
                                announcement={false}
                            />
                        </View>
                    </ModalFooter>
                </View>
            </Pressable>
        </View>
    )
}

export default Rcreate