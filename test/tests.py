import unittest
import boto3
import requests
import math

BASE_URL = 'https://uym4sxob2i.execute-api.us-east-1.amazonaws.com/dev/'

class TestApp(unittest.TestCase):
    def setUp(self):
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table('pet_table')

        #simple_dog
        table.put_item(
            Item={
                'petId' : '1',
                'age' : '3',
                'breed' : 'golden_retriever',
                'zipcode' : '90210',
                'name' : 'simple_dog',
                'gender' : 'female',
                'species' : 'dog'
            }
        )

        #age_less_than_1
        table.put_item(
            Item={
                'petId': '2',
                'age': '0',
                'breed': 'golden_retriever',
                'zipcode': '90210',
                'name': 'age_less_than_1',
                'gender': 'female',
                'species': 'dog'
            }
        )

        #age_greater_than_8
        table.put_item(
            Item={
                'petId': '3',
                'age': '20',
                'breed': 'golden_retriever',
                'zipcode': '90210',
                'name': 'age_greater_than_8',
                'gender': 'female',
                'species': 'dog'
            }
        )

        #default_zipcode
        table.put_item(
            Item={
                'petId': '4',
                'age': '3',
                'breed': 'golden_retriever',
                'zipcode': '0000000',
                'name': 'default_zipcode',
                'gender': 'female',
                'species': 'dog'
            }
        )

        #default_dog_breed
        table.put_item(
            Item={
                'petId': '5',
                'age': '3',
                'breed': 'corgi',
                'zipcode': '90210',
                'name': 'default_dog_breed',
                'gender': 'female',
                'species': 'dog'
            }
        )

        #simple_cat
        table.put_item(
            Item={
                'petId': '6',
                'age': '8',
                'breed': 'siamese',
                'zipcode': '02481',
                'name': 'simple_cat',
                'gender': 'female',
                'species': 'cat'
            }
        )

        #default_cat_breed
        table.put_item(
            Item={
                'petId': '7',
                'age': '8',
                'breed': 'bobtail',
                'zipcode': '02481',
                'name': 'default_cat_breed',
                'gender': 'female',
                'species': 'cat'
            }
        )

    def test_simple_dog(self):
        response = requests.get(BASE_URL + 'quote/1')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 181.98)

    def test_age_less_than_1(self):
        response = requests.get(BASE_URL + 'quote/2')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 181.35)

    def test_age_greater_than_8(self):
        response = requests.get(BASE_URL + 'quote/3')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 183.375)

    def test_default_zipcode(self):
        response = requests.get(BASE_URL + 'quote/4')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 182.115)

    def test_default_dog_breed(self):
        response = requests.get(BASE_URL + 'quote/5')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 181.755)

    def test_simple_cat(self):
        response = requests.get(BASE_URL + 'quote/6')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 182.835)

    def test_default_cat_breed(self):
        response = requests.get(BASE_URL + 'quote/7')
        assert response.status_code == 200

        quote = response.json()['quote']
        assert math.isclose(quote, 182.61)

    def test_pet_not_found_error(self):
        response = requests.get(BASE_URL + 'quote/100')
        assert response.status_code == 404

if __name__ == '__main__':
    unittest.main()