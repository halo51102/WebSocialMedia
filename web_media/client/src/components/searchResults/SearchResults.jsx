import { Link, useNavigate } from "react-router-dom";
import "./searchResults.scss";
import profileAlt from "../../assets/profileAlt.png"
export const SearchResults = ({ results }) => {
    console.log(results)
    let empty = []

    const navigate = useNavigate();

    return (
        <div className="results">

            {(results !== empty)
                ?
                results.map((result, id) =>
                (<Link
                    to={"/profile/" + result.id}
                    // onClick={() => {
                    //     navigate("/profile/" + result.id, { replace: true });
                    //     window.location.reload();
                    // }}
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <div className="result" key={id} >
                        <div className="info">
                            <img
                                src={result?.profilePic ? "/upload/" + result?.profilePic : profileAlt}
                                alt="" />
                            <span>{result.name}</span>
                        </div>
                    </div>
                </Link>)
                )

                :
                <div className="result"><span>Không có kết quả</span></div>
            }
        </div>
    );
};