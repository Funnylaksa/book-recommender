# Project Bookworm - Book Recommendation-System

The books dataset is taken from https://github.com/malcolmosh/goodbooks-10k-extended/blob/master/README.md. The dataset contains ten thousand most popular books with over six million ratings.

## Overview
There are 3 inputs to this application. 
1) User ID
2) Genre
3) Book 

Based on the inputs, a list of recommended books will be returned using different recommendation models. The default list is set to a 100 books and can be lower depending on the inputs. 


## Finding similar books (Collaborative Filtering)
Using Collaborative Deep Learning (CDL), a recommender model is created based on the user ratings. This aim is to recommend based on collaborative filtering, to recommend user books based on what similar users rate highly. On top of ratings data, books description is also fed into the model, providing an additional dimension to boost the recommender using text modality. 

From the input dataset, user preferences data available in the form of ratings for books provided by a set of users. Using the preference data, CDL can be used to generate a list of recommended books based on what similar users like. 

When a book input is given, the model can also predict a list of other books which are like the given book based on the latent factors from CDL.


## Content Based Filtering
When a genre input is given, the model will return a list of most popular books in the selected genre. Popularity is calculated using the true Bayesian estimate, where a score is given using both the average ratings and rating counts. Even if a rating of a book is high, it might rank lower on this estimate score system if it has low rating counts.

When no inputs are given, which simulates a cold start where no information is available about the new user, the most popular 100 books are returned as a result. From there, the user can select the books and find similar books to their selection.
 
 
## Multiple inputs
When multiple inputs are given, recommended list of books are generated for each input. Books that appear in multiple recommendations will be placed at the top, with the remaining choices added to list in a round robin fashion.


## Future Works
In a real-world scenario, book similarity can be calculated in real time based on users’ input. For personalised recommendation, CDL can be regenerated on a weekly basis to take in data of new users and new ratings from existing users to build up a stronger recommender. 



### Credits 
Base frontend framework and design inspired by below project. Thank you!
https://github.com/Tharun-tharun/Movie-Recommendation-System-with-Sentiment-Analysis


