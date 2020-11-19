const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../server');

it('OK, getting data', (done) =>{
    request(app)
        .get('/mashup/8b8a38a9-a290-4560-84f6-3d4466e8d791')
        .expect('Content-Type',/json/)
        .expect(200)
        .then(res =>{

            expect(res.body.mbid).to.equal('8b8a38a9-a290-4560-84f6-3d4466e8d791');
            expect(res.body.albums.length).to.equal(25);
            expect(res.body.description).to.be.a('string');
            done()
        })

        .catch(err=>{
        done(err)
    })
})

it('OK, getting data', (done) => {
    request(app)
        .get('/mashup/f90e8b26-9e52-4669-a5c9-e28529c47894')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {

            expect(res.body.mbid).to.equal('f90e8b26-9e52-4669-a5c9-e28529c47894');
            expect(res.body.albums.length).to.equal(25);
            expect(res.body.description).to.be.a('string');
            done()
        })

        .catch(err => {
            done(err)
        })
})

it('Try error', (done) => {
    request(app)
        .get('/mashup/f9')
        .expect('Content-Type', /json/)
        .expect(422)
        .then(res => {
            expect(res.body.error).to.be.a('string');
            done()

        })

        .catch(err => {
            done(err)
        })
})