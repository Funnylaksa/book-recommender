import pandas as pd
from flask import Flask, render_template, request
import random
from ast import literal_eval

# load the nlp model and tfidf vectorizer from disk
# filename = 'nlp_model.pkl'
# clf = pickle.load(open(filename, 'rb'))
# vectorizer = pickle.load(open('tranform.pkl', 'rb'))


# Load Books and Recommended DataFrame
df = pd.read_csv("datasets/books_enriched_clean.csv", encoding='utf8')
df_recommend_by_user = pd.read_csv("datasets/recommend_by_user.csv", index_col="user_id",
                                   converters={"recommended_books": literal_eval})
df_recommend_by_book = pd.read_csv("datasets/recommend_by_book.csv", index_col="book_id",
                                   converters={"recommended_books": literal_eval})


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


def clean_str(my_string):
    return my_string.replace("[", "").replace("]", "").replace("'", "")


app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home():
    suggestions = get_suggestions()
    return render_template('home.html', suggestions=suggestions)


@app.route("/recommend", methods=["POST"])
def recommend():
    # Get input from Web App FrontEnd
    title = request.form['title']
    user_id = request.form['user']
    genre = request.form['genre']
    print(title)
    print(user_id)
    print(genre)

    # If book chosen, display info on book
    ser = df[df["original_title"].str.contains(title, case=False)]
    release_date = int(ser["original_publication_year"].values[0])
    poster = ser["image_url"].values[0]
    vote_average = ser["average_rating"].values[0]
    vote_count = ser["ratings_count"].values[0]
    authors = clean_str(ser["authors"].values[0])
    overview = ser["description"].values[0]
    genres = clean_str(ser["genres"].values[0])

    # Recommended Items based on inputs
    # df_rec = df.drop_duplicates("original_title").sample(n=100)
    if title != "":
        book_id = df[df["original_title"].str.contains(title, case=False)].book_id.values[0]
        rec_list = df_recommend_by_book.loc[[book_id]].recommended_books.values[0]
    elif user_id != "":
        rec_list = df_recommend_by_user.loc[[int(user_id)]].recommended_books.values[0]
    else:
        rec_list = random.sample(range(10000), 100)
    df_rec = df[df.book_id.isin(rec_list)]

    # Details of recommended items
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
                           vote_count=vote_count, release_date=release_date, authors=authors, user_id=user_id,
                           poster=poster, book_cards=book_cards, overview=overview, genres=genres, genre=genre)
    # return render_template('recommend.html',title=title,poster=poster,overview=overview,vote_average=vote_average,
    #     vote_count=vote_count,release_date=release_date,book_rel_date=book_rel_date,curr_date=curr_date,runtime=runtime,status=status,genres=genres,book_cards=book_cards,reviews=movie_reviews,casts=casts,cast_details=cast_details)


if __name__ == '__main__':
    app.run(debug=True)
