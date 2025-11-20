// TODO:
//  Navbar
//  Selectable board
//  Create new board button
//   - UI for creating new board

import './Dashboard.css'

function Dashboard() {
    return (
        <div className="Dashboard">
            <Navbar />

            <BoardContainer>

            </BoardContainer>
        </div>
    )
}

function Navbar() {
    return (
        <div className="navbar">
            
        </div>
    )
}

function BoardContainer() {
    function handleClick() {
        console.log("Clicked!");
    }

    return (
        <div className="board-container" onClick={handleClick}>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div>
            <div className='dashboard-board'></div> 
        </div>
    )
}

export default Dashboard;