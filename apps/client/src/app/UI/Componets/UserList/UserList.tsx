import React from "react";
import User from "../User/User";
import './UserList.scss';
import {PlayerDto} from "@planning-poker/shared/backend-api-client"
import { useGlobalState } from "../../../GlobalStateProvider";

export interface UserListProps {
  users:PlayerDto[];
}


export function UserList(props: UserListProps) {
  const { state, setState } = useGlobalState();
  
  const usersValues = [{"name" : "User1" , "card" : undefined},{"name" : "User2" , "card" : 2},{"name" : "User3" , "card" : 3}];
  const userss = props.users.map(value => {
    if(value.player !== state.userName){
      return <li key={value.player} className="UserList-item" ><User key={value.player} value={value.score??undefined} userName={value.player} /></li>
    } 
    else {
      return null;
    } 
  })
  return (
    <div className='UserList-container'>
      <ul className='UserList-subcontainer'>
        <li key={state.userName} className="UserList-item" ><User key={state.userName} value={state.cardPicked} userName={state.userName} /></li>
        {userss}
      </ul>
    </div>
  );
}

export default UserList;
