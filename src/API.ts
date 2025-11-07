/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateAnnouncementInput = {
  id?: string | null,
  schoolAndBoard: string,
  title: string,
  body: string,
  path?: string | null,
  aspectRatio?: string | null,
  startDate: string,
  endDate: number,
  archiveDate: number,
  attachments?: Array< AttachInput | null > | null,
  authorName: string,
  authorId: string,
  authorPicture: string,
  authorRole: string,
  editType: Array< string | null >,
  editorId: Array< string | null >,
  editTime: Array< string | null >,
  editorname: Array< string | null >,
  deleted: boolean,
  skip: boolean,
};

export type AttachInput = {
  name: string,
  address: string,
  type: string,
  size?: string | null,
};

export type ModelAnnouncementConditionInput = {
  title?: ModelStringInput | null,
  body?: ModelStringInput | null,
  path?: ModelStringInput | null,
  aspectRatio?: ModelStringInput | null,
  startDate?: ModelStringInput | null,
  endDate?: ModelIntInput | null,
  archiveDate?: ModelIntInput | null,
  authorName?: ModelStringInput | null,
  authorId?: ModelStringInput | null,
  authorPicture?: ModelStringInput | null,
  authorRole?: ModelStringInput | null,
  editType?: ModelStringInput | null,
  editorId?: ModelStringInput | null,
  editTime?: ModelStringInput | null,
  editorname?: ModelStringInput | null,
  deleted?: ModelBooleanInput | null,
  skip?: ModelBooleanInput | null,
  and?: Array< ModelAnnouncementConditionInput | null > | null,
  or?: Array< ModelAnnouncementConditionInput | null > | null,
  not?: ModelAnnouncementConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Announcement = {
  __typename: "Announcement",
  id: string,
  schoolAndBoard: string,
  title: string,
  body: string,
  path?: string | null,
  aspectRatio?: string | null,
  startDate: string,
  endDate: number,
  archiveDate: number,
  attachments?:  Array<Attach | null > | null,
  authorName: string,
  authorId: string,
  authorPicture: string,
  authorRole: string,
  editType: Array< string | null >,
  editorId: Array< string | null >,
  editTime: Array< string | null >,
  editorname: Array< string | null >,
  deleted: boolean,
  skip: boolean,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type Attach = {
  __typename: "Attach",
  name: string,
  address: string,
  type: string,
  size?: string | null,
};

export type UpdateAnnouncementInput = {
  id: string,
  schoolAndBoard: string,
  title?: string | null,
  body?: string | null,
  path?: string | null,
  aspectRatio?: string | null,
  startDate?: string | null,
  endDate?: number | null,
  archiveDate?: number | null,
  attachments?: Array< AttachInput | null > | null,
  authorName?: string | null,
  authorId?: string | null,
  authorPicture?: string | null,
  authorRole?: string | null,
  editType?: Array< string | null > | null,
  editorId?: Array< string | null > | null,
  editTime?: Array< string | null > | null,
  editorname?: Array< string | null > | null,
  deleted?: boolean | null,
  skip?: boolean | null,
};

export type DeleteAnnouncementInput = {
  id: string,
  schoolAndBoard: string,
};

export type CreateResourceInput = {
  id?: string | null,
  schoolAndBoard: string,
  content: AttachInput,
  authorName: string,
  authorId: string,
  authorPicture: string,
  authorRole: string,
  editType: Array< string | null >,
  editorId: Array< string | null >,
  editTime: Array< string | null >,
  editorname: Array< string | null >,
};

export type ModelResourceConditionInput = {
  authorName?: ModelStringInput | null,
  authorId?: ModelStringInput | null,
  authorPicture?: ModelStringInput | null,
  authorRole?: ModelStringInput | null,
  editType?: ModelStringInput | null,
  editorId?: ModelStringInput | null,
  editTime?: ModelStringInput | null,
  editorname?: ModelStringInput | null,
  and?: Array< ModelResourceConditionInput | null > | null,
  or?: Array< ModelResourceConditionInput | null > | null,
  not?: ModelResourceConditionInput | null,
};

export type Resource = {
  __typename: "Resource",
  id: string,
  schoolAndBoard: string,
  content: Attach,
  authorName: string,
  authorId: string,
  authorPicture: string,
  authorRole: string,
  editType: Array< string | null >,
  editorId: Array< string | null >,
  editTime: Array< string | null >,
  editorname: Array< string | null >,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateResourceInput = {
  id: string,
  schoolAndBoard: string,
  content?: AttachInput | null,
  authorName?: string | null,
  authorId?: string | null,
  authorPicture?: string | null,
  authorRole?: string | null,
  editType?: Array< string | null > | null,
  editorId?: Array< string | null > | null,
  editTime?: Array< string | null > | null,
  editorname?: Array< string | null > | null,
};

export type DeleteResourceInput = {
  id: string,
  schoolAndBoard: string,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type ModelAnnouncementFilterInput = {
  id?: ModelIDInput | null,
  schoolAndBoard?: ModelStringInput | null,
  title?: ModelStringInput | null,
  body?: ModelStringInput | null,
  path?: ModelStringInput | null,
  aspectRatio?: ModelStringInput | null,
  startDate?: ModelStringInput | null,
  endDate?: ModelIntInput | null,
  archiveDate?: ModelIntInput | null,
  authorName?: ModelStringInput | null,
  authorId?: ModelStringInput | null,
  authorPicture?: ModelStringInput | null,
  authorRole?: ModelStringInput | null,
  editType?: ModelStringInput | null,
  editorId?: ModelStringInput | null,
  editTime?: ModelStringInput | null,
  editorname?: ModelStringInput | null,
  deleted?: ModelBooleanInput | null,
  skip?: ModelBooleanInput | null,
  and?: Array< ModelAnnouncementFilterInput | null > | null,
  or?: Array< ModelAnnouncementFilterInput | null > | null,
  not?: ModelAnnouncementFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelAnnouncementConnection = {
  __typename: "ModelAnnouncementConnection",
  items:  Array<Announcement | null >,
  nextToken?: string | null,
};

export type ModelResourceFilterInput = {
  id?: ModelIDInput | null,
  schoolAndBoard?: ModelStringInput | null,
  authorName?: ModelStringInput | null,
  authorId?: ModelStringInput | null,
  authorPicture?: ModelStringInput | null,
  authorRole?: ModelStringInput | null,
  editType?: ModelStringInput | null,
  editorId?: ModelStringInput | null,
  editTime?: ModelStringInput | null,
  editorname?: ModelStringInput | null,
  and?: Array< ModelResourceFilterInput | null > | null,
  or?: Array< ModelResourceFilterInput | null > | null,
  not?: ModelResourceFilterInput | null,
};

export type ModelResourceConnection = {
  __typename: "ModelResourceConnection",
  items:  Array<Resource | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionAnnouncementFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  schoolAndBoard?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  body?: ModelSubscriptionStringInput | null,
  path?: ModelSubscriptionStringInput | null,
  aspectRatio?: ModelSubscriptionStringInput | null,
  startDate?: ModelSubscriptionStringInput | null,
  endDate?: ModelSubscriptionIntInput | null,
  archiveDate?: ModelSubscriptionIntInput | null,
  authorName?: ModelSubscriptionStringInput | null,
  authorId?: ModelSubscriptionStringInput | null,
  authorPicture?: ModelSubscriptionStringInput | null,
  authorRole?: ModelSubscriptionStringInput | null,
  editType?: ModelSubscriptionStringInput | null,
  editorId?: ModelSubscriptionStringInput | null,
  editTime?: ModelSubscriptionStringInput | null,
  editorname?: ModelSubscriptionStringInput | null,
  deleted?: ModelSubscriptionBooleanInput | null,
  skip?: ModelSubscriptionBooleanInput | null,
  and?: Array< ModelSubscriptionAnnouncementFilterInput | null > | null,
  or?: Array< ModelSubscriptionAnnouncementFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionResourceFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  schoolAndBoard?: ModelSubscriptionStringInput | null,
  authorName?: ModelSubscriptionStringInput | null,
  authorId?: ModelSubscriptionStringInput | null,
  authorPicture?: ModelSubscriptionStringInput | null,
  authorRole?: ModelSubscriptionStringInput | null,
  editType?: ModelSubscriptionStringInput | null,
  editorId?: ModelSubscriptionStringInput | null,
  editTime?: ModelSubscriptionStringInput | null,
  editorname?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionResourceFilterInput | null > | null,
  or?: Array< ModelSubscriptionResourceFilterInput | null > | null,
};

export type CreateAnnouncementMutationVariables = {
  input: CreateAnnouncementInput,
  condition?: ModelAnnouncementConditionInput | null,
};

export type CreateAnnouncementMutation = {
  createAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateAnnouncementMutationVariables = {
  input: UpdateAnnouncementInput,
  condition?: ModelAnnouncementConditionInput | null,
};

export type UpdateAnnouncementMutation = {
  updateAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteAnnouncementMutationVariables = {
  input: DeleteAnnouncementInput,
  condition?: ModelAnnouncementConditionInput | null,
};

export type DeleteAnnouncementMutation = {
  deleteAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type CreateResourceMutationVariables = {
  input: CreateResourceInput,
  condition?: ModelResourceConditionInput | null,
};

export type CreateResourceMutation = {
  createResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateResourceMutationVariables = {
  input: UpdateResourceInput,
  condition?: ModelResourceConditionInput | null,
};

export type UpdateResourceMutation = {
  updateResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteResourceMutationVariables = {
  input: DeleteResourceInput,
  condition?: ModelResourceConditionInput | null,
};

export type DeleteResourceMutation = {
  deleteResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetAnnouncementQueryVariables = {
  id: string,
  schoolAndBoard: string,
};

export type GetAnnouncementQuery = {
  getAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListAnnouncementsQueryVariables = {
  id?: string | null,
  schoolAndBoard?: ModelStringKeyConditionInput | null,
  filter?: ModelAnnouncementFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListAnnouncementsQuery = {
  listAnnouncements?:  {
    __typename: "ModelAnnouncementConnection",
    items:  Array< {
      __typename: "Announcement",
      id: string,
      schoolAndBoard: string,
      title: string,
      body: string,
      path?: string | null,
      aspectRatio?: string | null,
      startDate: string,
      endDate: number,
      archiveDate: number,
      attachments?:  Array< {
        __typename: "Attach",
        name: string,
        address: string,
        type: string,
        size?: string | null,
      } | null > | null,
      authorName: string,
      authorId: string,
      authorPicture: string,
      authorRole: string,
      editType: Array< string | null >,
      editorId: Array< string | null >,
      editTime: Array< string | null >,
      editorname: Array< string | null >,
      deleted: boolean,
      skip: boolean,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetResourceQueryVariables = {
  id: string,
  schoolAndBoard: string,
};

export type GetResourceQuery = {
  getResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListResourcesQueryVariables = {
  id?: string | null,
  schoolAndBoard?: ModelStringKeyConditionInput | null,
  filter?: ModelResourceFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListResourcesQuery = {
  listResources?:  {
    __typename: "ModelResourceConnection",
    items:  Array< {
      __typename: "Resource",
      id: string,
      schoolAndBoard: string,
      content:  {
        __typename: "Attach",
        name: string,
        address: string,
        type: string,
        size?: string | null,
      },
      authorName: string,
      authorId: string,
      authorPicture: string,
      authorRole: string,
      editType: Array< string | null >,
      editorId: Array< string | null >,
      editTime: Array< string | null >,
      editorname: Array< string | null >,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type AnnouncementsBySchoolAndBoardQueryVariables = {
  schoolAndBoard: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelAnnouncementFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type AnnouncementsBySchoolAndBoardQuery = {
  announcementsBySchoolAndBoard?:  {
    __typename: "ModelAnnouncementConnection",
    items:  Array< {
      __typename: "Announcement",
      id: string,
      schoolAndBoard: string,
      title: string,
      body: string,
      path?: string | null,
      aspectRatio?: string | null,
      startDate: string,
      endDate: number,
      archiveDate: number,
      attachments?:  Array< {
        __typename: "Attach",
        name: string,
        address: string,
        type: string,
        size?: string | null,
      } | null > | null,
      authorName: string,
      authorId: string,
      authorPicture: string,
      authorRole: string,
      editType: Array< string | null >,
      editorId: Array< string | null >,
      editTime: Array< string | null >,
      editorname: Array< string | null >,
      deleted: boolean,
      skip: boolean,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ResourcesBySchoolAndBoardQueryVariables = {
  schoolAndBoard: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelResourceFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ResourcesBySchoolAndBoardQuery = {
  resourcesBySchoolAndBoard?:  {
    __typename: "ModelResourceConnection",
    items:  Array< {
      __typename: "Resource",
      id: string,
      schoolAndBoard: string,
      content:  {
        __typename: "Attach",
        name: string,
        address: string,
        type: string,
        size?: string | null,
      },
      authorName: string,
      authorId: string,
      authorPicture: string,
      authorRole: string,
      editType: Array< string | null >,
      editorId: Array< string | null >,
      editTime: Array< string | null >,
      editorname: Array< string | null >,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateAnnouncementSubscriptionVariables = {
  filter?: ModelSubscriptionAnnouncementFilterInput | null,
  owner?: string | null,
};

export type OnCreateAnnouncementSubscription = {
  onCreateAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateAnnouncementSubscriptionVariables = {
  filter?: ModelSubscriptionAnnouncementFilterInput | null,
  owner?: string | null,
};

export type OnUpdateAnnouncementSubscription = {
  onUpdateAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteAnnouncementSubscriptionVariables = {
  filter?: ModelSubscriptionAnnouncementFilterInput | null,
  owner?: string | null,
};

export type OnDeleteAnnouncementSubscription = {
  onDeleteAnnouncement?:  {
    __typename: "Announcement",
    id: string,
    schoolAndBoard: string,
    title: string,
    body: string,
    path?: string | null,
    aspectRatio?: string | null,
    startDate: string,
    endDate: number,
    archiveDate: number,
    attachments?:  Array< {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    } | null > | null,
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    deleted: boolean,
    skip: boolean,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnCreateResourceSubscriptionVariables = {
  filter?: ModelSubscriptionResourceFilterInput | null,
  owner?: string | null,
};

export type OnCreateResourceSubscription = {
  onCreateResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateResourceSubscriptionVariables = {
  filter?: ModelSubscriptionResourceFilterInput | null,
  owner?: string | null,
};

export type OnUpdateResourceSubscription = {
  onUpdateResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteResourceSubscriptionVariables = {
  filter?: ModelSubscriptionResourceFilterInput | null,
  owner?: string | null,
};

export type OnDeleteResourceSubscription = {
  onDeleteResource?:  {
    __typename: "Resource",
    id: string,
    schoolAndBoard: string,
    content:  {
      __typename: "Attach",
      name: string,
      address: string,
      type: string,
      size?: string | null,
    },
    authorName: string,
    authorId: string,
    authorPicture: string,
    authorRole: string,
    editType: Array< string | null >,
    editorId: Array< string | null >,
    editTime: Array< string | null >,
    editorname: Array< string | null >,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
