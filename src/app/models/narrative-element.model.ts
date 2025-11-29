import { IPoint } from "@foblex/2d";

export interface NarrativeElementModel {
    id: number;
    description: string;
    name: string;
    type: NarrativeElementTypeModel;
    nodePosition: IPoint;
    historyId?: number;
}

export interface NarrativeElementTypeModel {
    id: number;
    name: string;
}

export interface RelationshipModel {
    id: number;
    from: NarrativeElementModel;
    to: NarrativeElementModel;
    type?: RelationshipTypeModel;
}

export interface RelationshipTypeModel {
    id: number;
    name: string;
}

export interface NodeConnectionModel {
    id: number;
    out: number;
    in: number;
    type: string;
}

