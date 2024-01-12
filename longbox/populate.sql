use longboxtesting;
describe api_dump;
describe user_cards;
select * from api_dump;
select * from user_cards;

-- PLEASE UPDATE WITH APPROPRIATE FILE DIRECTORIES --
load data local infile 'C:/Users/SaltBlock/Desktop/LongBox/longbox/api_dump_import.txt' into table api_dump;
load data local infile 'C:/Users/SaltBlock/Desktop/LongBox/longbox/user_cards_import.txt' into table user_cards;


insert into user_cards (quantity, API_Dump_set, API_Dump_collector_code, folder_tag)
values(99, 'lci', 70, 'Pirate themed cards') as new_cards
ON DUPLICATE KEY UPDATE user_cards.quantity = user_cards.quantity+new_cards.quantity; 

insert into user_cards (API_Dump_set, API_Dump_collector_code)
values	('afr', 144),
		('cmr', 388),
        ('lci', 8),
        ('rav', 271)
ON DUPLICATE KEY UPDATE quantity = quantity+1;