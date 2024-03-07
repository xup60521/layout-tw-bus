export type BusList = {
    HasSubRoutes: boolean;
    SubRoutes:    [SubRoute, ...SubRoute[]];
    BusRouteType: number;
    RouteName: Name
    UpdateTime:   string;
    VersionID:    number;
}

type SubRoute = {
    SubRouteUID:  string;
    SubRouteID:   string;
    OperatorIDs:  string[];
    SubRouteName: Name;
    Headsign:     string;
    Direction:    number;
}

type Name = {
    Zh_tw: string;
    En:    string;
}

export type BusEst = {
    StopName:      Name;
    RouteName:     Name;
    Direction:     number;
    EstimateTime?: number;
    StopSequence:  number;
    StopStatus:    string;
    NextBusTime?:   string;
    SrcUpdateTime: string;
    UpdateTime:    string;
}


//車輛狀態備註 : [0:'正常',1:'尚未發車',2:'交管不停靠',3:'末班車已過',4:'今日未營運']


export type BusGeo = {
    RouteName:       Name;
    Direction:       number;
    Geometry:        string;
    EncodedPolyline: string;
    UpdateTime:      string;
    VersionID:       number;
}

export type BusStops = {
    RouteName:  Name;
    Direction:  number;
    Stops:      Stop[];
    UpdateTime: string;
    VersionID:  number;
}


type Stop = {
    StopUID:          string;
    StopID:           string;
    StopName:         Name;
    StopBoarding:     number;
    StopSequence:     number;
    StopPosition:     StopPosition;
    StationID:        string;
    StationGroupID:   string;
    LocationCityCode: LocationCityCode;
}

type LocationCityCode = "TXG";

type StopPosition = {
    PositionLon: number;
    PositionLat: number;
    GeoHash:     string;
}

export type BusRoutePassBy = {
    RouteName:     Name;
    Direction:     number;
    EstimateTime?: number;
    StopSequence:  number;
    StopStatus:    number;
    NextBusTime?:  string;
    SrcUpdateTime: string;
    UpdateTime:    string;
}

export type BusStopSearchResult = {
    StopName: Name;
    UpdateTime: string;
    VersionID: number;
}

export type BusOverlay = BusGeo & {
    Stops: BusStops["Stops"];
  };