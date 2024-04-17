import React, { useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer } from '@react-google-maps/api';
import { database } from './Firebase/firebase';
import { get, ref, remove, push, query, orderByKey, onValue, limitToLast} from 'firebase/database';
import './Map.css';

const center = {
    lat: 46.479542,
    lng: 30.754698
}

const containerStyle = { width: '100%', height: '100vh' }

export default function Map() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY || 'your-api-key'
    })

    const [map, setMap] = React.useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = React.useState<{ position: google.maps.LatLngLiteral, number: number }[]>([]);
    const [nextMarkerNumber, setNextMarkerNumber] = React.useState<number>(1);

    const onLoad = useCallback((map: google.maps.Map | null) => {
        if (!map) return;
    
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map);
    }, [center, setMap]);

    const onMapClick = (event: google.maps.MapMouseEvent) => {
        if (map && event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            const timestamp = new Date().toTimeString();

            const markerObject = {
                [`Quest ${nextMarkerNumber}`]:{
                Location: `${lat}, ${lng}`,
                Timestamp: timestamp,
                Next: ''
            }}

            const markerObjectLast = {
                [`Quest ${nextMarkerNumber}`]:{
                    Location: `${lat}, ${lng}`,
                    Timestamp: timestamp
            }}

            const markersRef = ref(database, 'markers');
            const lastItemQuery = query(markersRef, orderByKey(), limitToLast(1));

            let lastItemKey: any;
            
            onValue(lastItemQuery, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    lastItemKey = childSnapshot.key;
                })
            })

            if(lastItemKey) {
                push(markersRef, markerObjectLast)
            } else {
                push(markersRef, markerObject);
            }

            setMarkers((prevMarkers) => [
                ...prevMarkers,
                {
                    position: { lat: lat, lng: lng },
                    number: nextMarkerNumber
                }
            ]);
            
            setNextMarkerNumber((prevNumber) => prevNumber + 1);
        }
    };

    const deleteMarker = (markerNumber: number) => {
        const markersRef = ref(database, 'markers');
        get(markersRef).then((snapshot) => {
            const markersData = snapshot.val();
            Object.keys(markersData).forEach((key) => {
                if(markersData[key].Next === markerNumber) {
                    remove(ref(database, `markers/${key}`));
                }
            });
        }).catch((error) => {
            console.error("Error deleting marker:", error);
        });
        setMarkers((prevMarkers) => prevMarkers.filter(marker => marker.number !== markerNumber));
    }

    const deleteAllMarkers = () => {
        setMarkers([])
    }

    const onMarkerDragEnd = (markerNumber: number, event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            setMarkers((prevMarkers) => prevMarkers.map(marker => {
                if (marker.number === markerNumber) {
                    return { ...marker, position: { lat: lat, lng: lng } };
                }
                return marker;
            }));
        }
    };

    return isLoaded ? (
        <div>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onLoad}
                onClick={onMapClick}
            >
                <MarkerClusterer
                    options={{ imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m" }}
                >
                    {(clusterer) => (
                        <>
                            {markers.map((marker, index) => (
                                <Marker
                                    key={index}
                                    position={marker.position}
                                    draggable
                                    onDragEnd={(event) => onMarkerDragEnd(marker.number, event)}
                                    label={`${marker.number}`}
                                    clusterer={clusterer}
                                >
                                    <div className='delete-btn-container'>
                                    <button
                                        onClick={() => deleteMarker(marker.number)}
                                        className='delete-btn'
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className='delete-all-btn'
                                        onClick={deleteAllMarkers}
                                    >
                                        Delete All Markers
                                    </button>
                                </div>
                                </Marker>
                            ))}
                        </>
                    )}
                </MarkerClusterer>
            </GoogleMap>
        </div>
    ) : null
}