# Project Bookworm - Book Recommendation-System

The books dataset is taken from https://github.com/zygmuntz/goodbooks-10k. The dataset contains ten thousand most popular books with over six million ratings.

## Finding similar books
### Collabarative Filtering (Just based on ratings)

Using Weighted Matrix Factorisation, a recommender model is created based on the user ratings. This aim is to recommend based on collaborative filtering, to recommend user books based on what similar users rates highly. 

### Content Based Filtering

Based on the features available, similarity score of the books are calculated. After user chooses a book, the app will return a list of books that are most similar to the chosen book using cosine similarity.


### Credits 

Base frontend framework and design inspired by below project. Thank you!
https://github.com/Tharun-tharun/Movie-Recommendation-System-with-Sentiment-Analysis


