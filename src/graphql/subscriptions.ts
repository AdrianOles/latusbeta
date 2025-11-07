/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateAnnouncement = /* GraphQL */ `subscription OnCreateAnnouncement(
  $filter: ModelSubscriptionAnnouncementFilterInput
  $owner: String
) {
  onCreateAnnouncement(filter: $filter, owner: $owner) {
    id
    schoolAndBoard
    title
    body
    path
    aspectRatio
    startDate
    endDate
    archiveDate
    attachments {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    deleted
    skip
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateAnnouncementSubscriptionVariables,
  APITypes.OnCreateAnnouncementSubscription
>;
export const onUpdateAnnouncement = /* GraphQL */ `subscription OnUpdateAnnouncement(
  $filter: ModelSubscriptionAnnouncementFilterInput
  $owner: String
) {
  onUpdateAnnouncement(filter: $filter, owner: $owner) {
    id
    schoolAndBoard
    title
    body
    path
    aspectRatio
    startDate
    endDate
    archiveDate
    attachments {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    deleted
    skip
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateAnnouncementSubscriptionVariables,
  APITypes.OnUpdateAnnouncementSubscription
>;
export const onDeleteAnnouncement = /* GraphQL */ `subscription OnDeleteAnnouncement(
  $filter: ModelSubscriptionAnnouncementFilterInput
  $owner: String
) {
  onDeleteAnnouncement(filter: $filter, owner: $owner) {
    id
    schoolAndBoard
    title
    body
    path
    aspectRatio
    startDate
    endDate
    archiveDate
    attachments {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    deleted
    skip
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteAnnouncementSubscriptionVariables,
  APITypes.OnDeleteAnnouncementSubscription
>;
export const onCreateResource = /* GraphQL */ `subscription OnCreateResource(
  $filter: ModelSubscriptionResourceFilterInput
  $owner: String
) {
  onCreateResource(filter: $filter, owner: $owner) {
    id
    schoolAndBoard
    content {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateResourceSubscriptionVariables,
  APITypes.OnCreateResourceSubscription
>;
export const onUpdateResource = /* GraphQL */ `subscription OnUpdateResource(
  $filter: ModelSubscriptionResourceFilterInput
  $owner: String
) {
  onUpdateResource(filter: $filter, owner: $owner) {
    id
    schoolAndBoard
    content {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateResourceSubscriptionVariables,
  APITypes.OnUpdateResourceSubscription
>;
export const onDeleteResource = /* GraphQL */ `subscription OnDeleteResource(
  $filter: ModelSubscriptionResourceFilterInput
  $owner: String
) {
  onDeleteResource(filter: $filter, owner: $owner) {
    id
    schoolAndBoard
    content {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteResourceSubscriptionVariables,
  APITypes.OnDeleteResourceSubscription
>;
