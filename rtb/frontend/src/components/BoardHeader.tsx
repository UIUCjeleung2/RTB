// Header containing title, task completion checkmark, and up arrow


export default function BoardHeader(name: string) {
    return (<div className="boardHeader">
            <UpButton />
            <h1>{name}</h1>
    </div>)
}

function UpButton() {

    return (<div className="up-button">
        
    </div>)
}