from typing import Any

import pandas as pd
from flask import Flask, render_template, request
import random
from ast import literal_eval
from collections import OrderedDict

# Load Books and Recommended DataFrame
df = pd.read_csv("datasets/books_enriched_clean.csv", encoding='utf8')
most_pop = pd.read_csv("datasets/most_pop.csv")
df_recommend_by_user = pd.read_csv("datasets/recommend_by_user.csv", index_col="user_id",
                                   converters={"recommended_books": literal_eval})
df_recommend_by_book = pd.read_csv("datasets/recommend_by_book.csv", index_col="book_id",
                                   converters={"recommended_books": literal_eval})


def get_suggestions():
    return list(df["original_title"].str.capitalize())


def clean_str(my_string):
    return my_string.replace("[", "").replace("]", "").replace("'", "")


def escape_special_char(my_string):
    return my_string.replace("+", "\+").replace("^", "\^").replace("(", "\(").replace(")", "\)").replace("?", "\?") \
        .replace("[", "\[").replace("]", "\]").replace("*", "\*").replace("$", "\$")


def combine(lst1, lst2, lst3=False):
    if lst3:
        similar = list(set(lst1) & set(lst2) & set(lst3))
        remain_count = (50 - len(similar)) // 3
        remain1 = [i for i in lst1 if i not in similar][:remain_count]
        remain2 = [i for i in lst2 if i not in similar][:remain_count]
        remain3 = [i for i in lst3 if i not in similar][:remain_count]
        return similar, remain1, remain2, remain3
    else:
        similar = list(set(lst1) & set(lst2))
        remain_count = (50 - len(similar)) // 2
        remain1 = [i for i in lst1 if i not in similar][:remain_count]
        remain2 = [i for i in lst2 if i not in similar][:remain_count]
        return similar, remain1, remain2


def get_recommended_list(lst):
    if not lst:
        return []
    df_rec = pd.DataFrame()
    for id in lst:
        df_rec = df_rec.append(df[df.book_id == id])
    rec_posters = list(df_rec["image_url"])
    rec_books = list(df_rec["original_title"])
    rec_vote = list(df_rec["average_rating"])
    rec_year = [int(i) for i in list(df_rec["original_publication_year"])]
    rec_books_org = rec_books

    return {rec_posters[i]: [rec_books[i], rec_books_org[i], rec_vote[i], rec_year[i]] for i in
            range(len(rec_posters))}


app = Flask(__name__)


@app.route("/")
@app.route("/home")
def home():
    suggestions = get_suggestions()
    return render_template('home.html', suggestions=suggestions)


@app.route("/recommend", methods=["POST"])
def recommend():
    # Get input from Web App FrontEnd
    k = 50
    title = escape_special_char(request.form['title'])
    user_id = request.form['user']
    genre = request.form['genre']
    print(f"title: {title}")
    print(f"user_id: {user_id}")
    print(f"genre: {genre}")
    book_lst = user_lst = genre_lst = combine_lst = pop_lst = []

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
    if title != "" and user_id != "" and genre != "":
        book_id = df[df["original_title"].str.contains(title, case=False)].book_id.values[0]
        book_mask = df_recommend_by_book.loc[[book_id]].recommended_books.values[0]
        user_mask = df_recommend_by_user.loc[[int(user_id)]].recommended_books.values[0]
        genre_mask = list(most_pop[most_pop.genres.str.contains(genre)].book_id)[:50]
        combine_lst, book_lst, user_lst, genre_lst = combine(book_mask, user_mask, genre_mask)
        print("recommend based on title, user & genre")

    elif title != "" and user_id != "":
        book_id = df[df["original_title"].str.contains(title, case=False)].book_id.values[0]
        book_mask = df_recommend_by_book.loc[[book_id]].recommended_books.values[0]
        user_mask = df_recommend_by_user.loc[[int(user_id)]].recommended_books.values[0]
        combine_lst, book_lst, user_lst = combine(book_mask, user_mask)
        print("recommend based on title & user")

    elif title != "" and genre != "":
        book_id = df[df["original_title"].str.contains(title, case=False)].book_id.values[0]
        book_mask = df_recommend_by_book.loc[[book_id]].recommended_books.values[0]
        genre_mask = list(most_pop[most_pop.genres.str.contains(genre)].book_id)[:50]
        combine_lst, genre_lst, book_lst = combine(genre_mask, book_mask)
        print("recommend based on title & genre")

    elif user_id != "" and genre != "":
        user_mask = df_recommend_by_user.loc[[int(user_id)]].recommended_books.values[0]
        genre_mask = list(most_pop[most_pop.genres.str.contains(genre)].book_id)[:50]
        combine_lst, genre_lst, user_lst = combine(genre_mask, user_mask)
        print("recommend based on user & genre")

    elif title != "":
        book_id = df[df["original_title"].str.contains(title, case=False)].book_id.values[0]
        book_lst = df_recommend_by_book.loc[[book_id]].recommended_books.values[0]
        print("recommend based on title")

    elif user_id != "":
        user_lst = df_recommend_by_user.loc[[int(user_id)]].recommended_books.values[0]
        print("recommend based on user")

    elif genre != "":
        genre_lst = list(most_pop[most_pop.genres.str.contains(genre)].head(50).book_id)
        print("recommend based on genre")

    else:
        pop_lst = list(most_pop.book_id)[:50]
        print("recommend based on most popular")

    print(f"combine list: {combine_lst}")
    print(f"genre list: {genre_lst}")
    print(f"book list: {book_lst}")
    print(f"user list: {user_lst}")

    # if combine_lst:
    book_cards = get_recommended_list(combine_lst)
    g_book_cards = get_recommended_list(genre_lst)
    b_book_cards = get_recommended_list(book_lst)
    u_book_cards = get_recommended_list(user_lst)
    p_book_cards = get_recommended_list(pop_lst)

    # passing all the data to the html file
    return render_template('recommend.html', title=title, vote_average=vote_average,
                           vote_count=vote_count, release_date=release_date, authors=authors, user_id=user_id,
                           poster=poster, book_cards=book_cards, overview=overview, genres=genres, genre=genre,
                           b_book_cards=b_book_cards, u_book_cards=u_book_cards, g_book_cards=g_book_cards,
                           p_book_cards=p_book_cards)


if __name__ == '__main__':
    app.run(debug=True)
