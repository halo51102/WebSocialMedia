import "./searchResults.scss";

export const SearchResults = ({ results }) => {
    console.log(results)
    return (
        <div className="results">
            {results.map((result) => 
                (<div className="result" key={result.id}>
                    <div className="info">
                        <img
                            src={"/upload/" + result.profilePic}
                            alt="" />
                        <span>{result.username}</span>
                    </div>
                </div>)
            )}
        </div>
    );
};