import { Link, useNavigate } from "react-router-dom";
import "./searchResults.scss";
import profileAlt from "../../assets/profileAlt.png"
import { GrSearchAdvanced } from "react-icons/gr";
import { TbMoodEmpty } from "react-icons/tb";

export const SearchResults = ({ results, input }) => {
    const navigate = useNavigate();

    return (
        <div className="results">
            <div className="result" style={{ cursor: 'pointer' }}>
                <div className="info">
                    <GrSearchAdvanced />
                    <span>Tìm kiếm với từ khóa '{input}'</span>
                </div>
            </div>
            {(results.length !== 0)
                ? results.map((result, id) =>
                (<Link
                    to={"/profile/" + result.id}
                    onClick={() => {
                        navigate("/profile/" + result.id, { replace: true });
                        window.location.reload();
                    }}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <div className="result" key={id} >
                        <div className="info">
                            <img
                                src={result?.profilePic ? result?.profilePic : profileAlt}
                                alt="" />
                            <span>{result.name}</span>
                        </div>
                    </div>
                </Link>)
                )
                : <div className="no-result">
                    <div className="info" style={{ cursor: 'none' }}>
                        <TbMoodEmpty />
                        <span>Không có người dùng cần tìm</span>
                    </div>
                </div>
            }
        </div>
    );
};