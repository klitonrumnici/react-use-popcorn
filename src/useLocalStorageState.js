import {useEffect, useState} from "react";

export function useLocalStorageState(){
    const [watched, setWatched] = useState(function () {
        const storedValue = localStorage.getItem("watched");
        return JSON.parse(storedValue)
    });

    useEffect(() => {
        localStorage.setItem("watched", JSON.stringify(watched))
    }, [watched]);

    return [watched, setWatched]

}