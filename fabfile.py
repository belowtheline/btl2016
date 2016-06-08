from __future__ import print_function

import json
import os
import random

from fabric.api import local
from faker import Factory
import jinja2

tmpl_env = jinja2.Environment(loader=jinja2.FileSystemLoader('app/templates'))

def gendata():
    print("Generating random parties/candidates/ballots...")

    fake = Factory.create('en_AU')

    def _party():
        return '%s %s' % (fake.color_name(), fake.color_name())

    def _party_abbrev(party_name):
        return ''.join([x[0] for x in party_name.split()])

    def _candidate():
        last_name = fake.last_name()
        first_name = fake.first_name_female()
        return '%s, %s' % (last_name.upper(), first_name)

    parties = [_party() for x in range(15)]
    parties = {_party_abbrev(name): name for name in parties}

    reps_parties = random.sample(parties.keys(), 6)

    reps_candidates = []
    for position, party in enumerate(reps_parties, 1):
        reps_candidates.append({
            'position': position,
            'name': _candidate(),
            'party': party,
        })

    senate_candidates = []
    for position, party in enumerate(parties.keys(), 1):
        candidates = []
        for x in range(6):
            candidates.append({
                'position': x + 1,
                'name': _candidate(),
                'party': party,
            })
        senate_candidates.append({
            'position': position,
            'party': party,
            'candidates': candidates,
        })

    os.makedirs('data')

    data = {
        'parties': parties,
        'reps': reps_candidates,
        'senate': senate_candidates
    }
    with open('data/data.json', 'w') as datafile:
        json.dump(data, datafile)

def build():
    print("Rendering editor test html...")
    editor_test = tmpl_env.get_template('editor-test.html')
    with open('data/data.json') as datafile:
        data = datafile.read().strip()
    with open('public/editor-test.html', 'w') as outfile:
        outfile.write(editor_test.render(data=data))
