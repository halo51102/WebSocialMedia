import "./searchResults.scss";

export const SearchResults = ({ results }) => {
    console.log(results)
    let empty = []
    return (
        <div className="results">

            {(results !== empty)
                ?
                results.map((result) =>
                (<div className="result" key={result.id}>
                    <div className="info">
                        <img
                            src={"/upload/" + result.profilePic}
                            alt="" />
                        <span>{result.username}</span>
                    </div>
                </div>)
                )

                :
                <div className="result"><span>Không có kết quả</span></div>
            }
        </div>
    );
};