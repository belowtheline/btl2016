#!/usr/bin/env python

from __future__ import print_function

import atexit
import csv
import json
import pprint

import requests
from bs4 import BeautifulSoup

DATAFILE = '2016federalelection-all-candidates-nat-10-06-557.csv'

PARTY_ABBREVIATIONS = {
    '': 'IND',
    'Animal Justice Party': 'AJP',
    'Antipaedophile Party': 'AAP',
    'Australia First Party': 'AFN',
    'Australian Antipaedophile Party': 'AAP',
    'Australian Christians': 'AUC',
    'Australian Country Party': 'ACP',
    'Australian Cyclists Party': 'CYC',
    'Australian Labor Party': 'ALP',
    'Australian Labor Party (Northern Territory) Branch': 'ALP',
    'Australian Liberty Alliance': 'ALA',
    'Australian Motoring Enthusiast Party': 'AMEP',
    'Australian Progressives': 'APP',
    'Australian Recreational Fishers Party': 'RFP',
    'Australian Sex Party': 'ASXP',
    'Bullet Train For Australia': 'BTA',
    'Christian Democratic Party (Fred Nile Group)': 'CDP',
    'Citizens Electoral Council': 'CEC',
    'Consumer Rights & No-Tolls': 'CRT',
    'Country Liberals (NT)': 'CLP',
    'CountryMinded': 'CM',
    'DLP Democratic Labour': 'DLP',
    'Democratic Labour Party (DLP)': 'DLP',
    'Derryn Hinch\'s Justice Party': 'DHJ',
    'Drug Law Reform': 'DLF',
    'Family First': 'FFP',
    'Family First Party': 'FFP',
    'Glenn Lazarus Team': 'GLT',
    'Health Australia Party': 'HAP',
    'Independent': 'IND',
    'Jacqui Lambie Network': 'JLN',
    'Katter\'s Australian Party': 'KAP',
    'Labor': 'ALP',
    'Liberal': 'LIB',
    'Liberal Democrats': 'LDP',
    'Liberal National Party of Queensland': 'LNP',
    'MFP': 'MFP',
    'Marijuana (HEMP) Party': 'HMP',
    'Marriage Equality': 'MEP',
    'Mature Australia': 'MAP',
    'Nick Xenophon Team': 'NXT',
    'Non-Custodial Parents Party (Equal Parenting)': 'NCP',
    'Online Direct Democracy - (Empowering the People!)': 'ODD',
    'Outdoor Recreation Party (Stop The Greens)': 'ORP',
    'Palmer United Party': 'PUP',
    'Pauline Hanson\'s One Nation': 'ONP',
    'Pirate Party': 'PIR',
    'Pirate Party Australia': 'PIR',
    'Renewable Energy Party': 'REP',
    'Rise Up Australia Party': 'RUA',
    'Science Party': 'SCP',
    'Secular Party of Australia': 'SPA',
    'Seniors United Party of Australia': 'SUP',
    'Shooters, Fishers and Farmers': 'SFP',
    'Smokers Rights': 'SMK',
    'Socialist Alliance': 'SAL',
    'Socialist Equality Party': 'SEP',
    'Sustainable Australia': 'SA',
    'The Arts Party': 'TAP',
    'The Greens': 'GRN',
    'The Greens (WA)': 'GRN',
    'The Nationals': 'NAT',
    'VOTEFLUX.ORG | Upgrade Democracy!': 'FLX',
    'Veterans Party': 'ADVP',
    'Voluntary Euthanasia Party': 'VEP',
}
party_abbreviations_changed = False

senate = {}
reps = {}
current_state = None
ticket_counter = 0
position_counter = 0

def dump_abbrevs():
    if party_abbreviations_changed:
        print('PARTY_ABBREVIATIONS = {')
        for k in sorted(PARTY_ABBREVIATIONS.keys()):
            name = k.replace("'", "\\'")
            print("    '%s': '%s'," % (name, PARTY_ABBREVIATIONS[k]))
        print('}')
atexit.register(dump_abbrevs)

def import_reps(row):
    state = row['state_ab'].lower()
    division = row['div_nm']
    div = division.translate(None, "' ").lower()
    if div not in reps:
        reps[div] = {
            'name': division,
            'state': state,
            'candidates': [],
        }
    reps[div]['candidates'].append({
        'position': int(row['ballot_position']),
        'name': '%s, %s' % (row['surname'], row['ballot_given_nm']),
        'party': PARTY_ABBREVIATIONS[row['party_ballot_nm']],
    })

def import_senate(row):
    global current_state, ticket_counter, position_counter

    state = row['state_ab'].lower()
    if state != current_state:
        current_state = state
        ticket_counter = 0
        position_counter = 0

    if state not in senate:
        senate[state] = {}
    if row['ticket'] not in senate[state]:
        name = row['ticket'] + " Senate Group"
        ticket_counter += 1
        senate[state][row['ticket']] = {
            'position': ticket_counter,
            'ticket': row['ticket'],
            'name': name,
            'candidates': [],
        }
    position_counter += 1
    group = senate[state][row['ticket']]['candidates']
    group.append({
        'position': position_counter,
        'name': '%s, %s' % (row['surname'], row['ballot_given_nm']),
        'party': PARTY_ABBREVIATIONS[row['party_ballot_nm']],
    })

with open(DATAFILE) as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        if row['party_ballot_nm'] not in PARTY_ABBREVIATIONS:
            print(repr(row))
            PARTY_ABBREVIATIONS[row['party_ballot_nm']] = raw_input(row['party_ballot_nm'] + '> ')
            party_abbreviations_changed = True

        if row['nom_ty'] == 'H':
            import_reps(row)
        else:
            import_senate(row)

# for state in senate.keys():
#     page = requests.get('http://www.abc.net.au/news/federal-election-2016/guide/s%s/' % (state,))
#     soup = BeautifulSoup(page.text, 'html.parser')
#     table = soup.find('table', id='ballotpaper')
#     for group in table.find_all('tr', class_='groupheader'):
#         code = group.find('td', class_='shortnum').text
#         name = group.find('td', class_='candidate').text
#         print(code, name)
#     break

def ticket_sort(a, b):
    a = a['ticket']
    b = b['ticket']

    if len(a) != len(b):
        return cmp(len(a), len(b))
    return cmp(a, b)

for state in senate.keys():
    tickets = senate[state].values()
    tickets.sort(ticket_sort)
    senate[state] = tickets

for division in reps.keys():
    data = reps[division]
    data['senate'] = senate[data['state']]
    with open('data/%s.json' % division, 'w') as datafile:
        json.dump(data, datafile)
