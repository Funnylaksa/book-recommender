import pandas as pd
from flask import Flask, render_template, request

# load the nlp model and tfidf vectorizer from disk
# filename = 'nlp_model.pkl'
# clf = pickle.load(open(filename, 'rb'))
# vectorizer = pickle.load(open('tranform.pkl', 'rb'))


# Load Books DataFrame
# df_ratings = pd.read_csv("datasets/Ratings.csv")
# df_ratings = df_ratings.merge(df_books, left_on='ISBN', right_on='ISBN', how='left')
# df_ratings = df_ratings[df_ratings["Book-Rating"] != 0].dropna()
# df_books = pd.read_csv("datasets/Books.csv")
# df_combined = pd.read_csv("datasets/combined.csv")
df = pd.read_csv("datasets/books_enriched_clean.csv", encoding='utf8')


# converting list of string to list (eg. "["abc","def"]" to ["abc","def"])
def convert_to_list(my_list):
    my_list = my_list.split('","')
    my_list[0] = my_list[0].replace('["', '')
    my_list[-1] = my_list[-1].replace('"]', '')
    return my_list


# convert list of numbers to list (eg. "[1,2,3]" to [1,2,3])
def convert_to_list_num(my_list):
    my_list = my_list.split(',')
    my_list[0] = my_list[0].replace("[", "")
    my_list[-1] = my_list[-1].replace("]", "")
    return my_list


def get_suggestions():
    return list(df["original_title"].str.capitalize())


app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home():
    suggestions = get_suggestions()
    return render_template('home.html', suggestions=suggestions)


@app.route("/recommend", methods=["POST"])
def recommend():
    # Get data from df
    title = request.form['title']
    user = request.form['user']
    genre = request.form['genre']
    print(title)
    print(user)
    print(genre)

    # new dataset
    ser = df[df["original_title"].str.contains(title, case=False)]
    release_date = int(ser["original_publication_year"].values[0])
    poster = ser["image_url"].values[0]
    vote_average = ser["average_rating"].values[0]
    vote_count = ser["ratings_count"].values[0]
    authors = ser["authors"].values[0]
    overview = ser["description"].values[0]
    genres = ser["genres"].values[0]

    # recommended books(Currently set to random. To replace w results from recommender models)
    df_rec = df.drop_duplicates("original_title").sample(n=100)
    rec_posters = list(df_rec["image_url"])
    rec_books = list(df_rec["original_title"])
    rec_vote = list(df_rec["average_rating"])
    rec_year = [int(i) for i in list(df_rec["original_publication_year"])]
    rec_books_org = rec_books

    book_cards = {rec_posters[i]: [rec_books[i], rec_books_org[i], rec_vote[i], rec_year[i]] for i in
                  range(len(rec_posters))}

    # get movie suggestions for auto complete
    suggestions = get_suggestions()

    # passing all the data to the html file
    return render_template('recommend.html', title=title, vote_average=vote_average,
                           vote_count=vote_count, release_date=release_date, authors=authors,
                           poster=poster, book_cards=book_cards, overview=overview, genres=genres)
    # return render_template('recommend.html',title=title,poster=poster,overview=overview,vote_average=vote_average,
    #     vote_count=vote_count,release_date=release_date,book_rel_date=book_rel_date,curr_date=curr_date,runtime=runtime,status=status,genres=genres,book_cards=book_cards,reviews=movie_reviews,casts=casts,cast_details=cast_details)


if __name__ == '__main__':
    app.run(debug=True)
