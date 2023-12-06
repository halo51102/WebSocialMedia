import React, { useContext, useEffect, useRef, useState } from 'react';
import './createConversationForm.css'; // Import CSS file for styling
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import Multiselect from 'multiselect-react-dropdown';


const CreateConversationForm = ({ setNewConversation }) => {
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]); // Assuming you have a list of friends
  const [availableMembers] = useState([
    // Sample list of available members (replace this with your data)
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
    // Add more members as needed
  ]);
  const { currentUser } = useContext(AuthContext);
  const [state, setState] = useState({
    options: [{ name: 'Option 1️⃣', id: 1 }, { name: 'Option 2️⃣', id: 2 }]
  });
  const multiSelectRef = useRef()
  const getFriends = async () => {
    // Fetch friends list from your backend upon component mount
    try {
      const res = await makeRequest.get("/relationships/ed?followerUserId=" + currentUser.id)
      console.log("friends");
      setFriends(res.data);
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    getFriends();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(e.target.value);

    let filteredFriends = friends.filter(friend =>
      friend.username.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setSearchResults(filteredFriends);
  };

  const handleCreateGroup = () => {
    setShowForm(true);
  };

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleMemberSelection = (member) => {
    setSelectedMembers([...selectedMembers, member]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = (id) => {
    const updatedMembers = selectedMembers.filter(member => member.id !== id);
    setSelectedMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here, you can perform actions like sending data to your backend to create the group chat
    console.log('Group Name:', groupName);
    console.log('Selected Members:', selectedMembers);
    const res = await makeRequest.post("/conversations/", { "senderId": currentUser.id, "receiverId": selectedMembers[0].id, "name": selectedMembers.length > 1 ? groupName : null })
    console.log(res.data)
    setNewConversation(res.data.conversationId)
    multiSelectRef.current.resetSelectedValues()
    // Add logic to send data to create the group chat
  };

  return (

    <div className="create-group-container">

      {!showForm ? (
        <button className="chatSubmitButton" onClick={handleCreateGroup}>
          Create Conversation
        </button>
      ) : (
        <form className="group-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Conversation Name:</label>
            {selectedMembers.length > 1 ? (
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={handleGroupNameChange}
                required
              />
            ) : (<input
              type="text"
              id="groupName"
              value={groupName}
              onChange={handleGroupNameChange}
            />)}
          </div>
          <div className="form-group">
            <label htmlFor="searchMembers">Search Friends:</label>
            {/* <input
            type="text"
            id="searchMembers"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search friends..."
            />
            {searchResults.length > 0 && (<div className="search-results">
            <ul>
                {searchResults.map(member => (
                <li key={member.id} onClick={() => handleMemberSelection(member)}>
                    {member.username}
                </li>
                ))}
            </ul>
            </div>)} */}
            <Multiselect
              options={friends} // Options to display in the dropdown
              selectedValues={null} // Preselected value to persist in dropdown
              onSelect={(selectedList, selectedItem) => setSelectedMembers([...selectedMembers, selectedItem])} // Function will trigger on select event
              onRemove={(selectedList, removedItem) => setSelectedMembers(selectedMembers.filter((member) => member.id !== removedItem.id))} // Function will trigger on remove event
              displayValue="name" // Property name to display in the dropdown options
              style={{ chips: { background: "#007bff" }, searchBox: { borderRadius: "8px", background: "white" } }}
              ref={multiSelectRef}
            />
          </div>
          <div className='action-btns'>
            <button type="submit" className="submit-button">Create Conversation</button>
            <button type="button" className="close-modal-button" onClick={() => setShowForm(false)}>Close</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateConversationForm;
