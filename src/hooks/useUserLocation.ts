// src/hooks/useUserLocation.ts
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
// import { setUserLocation } from "../features/auth/authSlice";
import { getUserAddressGoogle } from "./useConvertUserCordintates";

interface UserLocation {
    lat: number;
    lon: number;
}

export const useUserLocation = () => {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [currentUserState,setCurrentUserState] = useState('')
    const [error, setError] = useState<string | null>(null);
    const [locationLoading, setlocationLoading] = useState<boolean>(true);
    const dispatch = useDispatch()

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setlocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                // dispatch(setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude, }));
                
                // setCurrentUserState(currentState)
                setlocationLoading(false);
            },
            (err) => {
                setError(err.message);
                setlocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    return { location, error, locationLoading,currentUserState };
};