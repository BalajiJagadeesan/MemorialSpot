import chai from 'chai';
import Validator from '../../src/lib/ValidatorClass';

const should = chai.should();

describe('Testing on Validators & Sanitizers', () => {
    let typeChecker;
    beforeEach(() => {
        typeChecker = new Validator();
    });
    context('--> ObjectID', () => {
        it('should be of length 24', () => {
            const id = 'kjhgf';
            typeChecker.analyseID(id);
            (typeChecker.errors).should.not.deep.equal([]);
        });
        it('Should be sanitized by sanitizer (remove spaces)', () => {
            const id = '  5a57cd0  626e8bd44b44ccc10';
            typeChecker.analyseID(id);
            (typeChecker.errors).should.deep.equal([]);
        });
        it('Should follow MongoDB ObjectID pattern for casting', () => {
            const id = '5a57cd0626e8bd44b4*c&c^0';
            typeChecker.analyseID(id);
            (typeChecker.errors).should.not.deep.equal([]);
        });
    });

    context('--> Name', () => {
        it('should be sanitized by sanitizer(remove spaces and first letter upper and others lower)', () => {
            const name = 'HARRI sOn  ';
            (typeChecker.analyseName(name)).should.equal('Harri Son');
        });
        it('Should not contain any numbers or special characters', () => {
            const name = 'H@rr1son';
            typeChecker.analyseName(name);
            (typeChecker.errors).should.not.deep.equal([]);
        });
    });

    context('--> Full Name', () => {
        it('should sanitize the input', () => {
            typeChecker.analyseFullName('  HARRISON ForD  ').should.equal('Harrison Ford');
        });
        it('should be of character 2 to 30', () => {
            typeChecker.analyseFullName('y');
            (typeChecker.errors).should.not.deep.equal([]);
        });
        it('should be made up of only alphabets', () => {
            typeChecker.analyseFullName('HAr@1Son ford');
            (typeChecker.errors).should.not.deep.equal([]);
        });
    });

    context('--> URL', () => {
        it('should sanitize the input', () => {
            const url = 'https://res.cloudinary.com/parkapi/jhgf//jhgf  ';
            const array = 'https://res.cloudinary.com/parkapi/jhgf//jhgf';
            (typeChecker.analyseURL(url)).should.equal(array);
        });
        it('should be well formed URL', () => {
            const url = 'https:!/www.google.com';
            typeChecker.analyseURL(url);
            (typeChecker.errors[0]).should.equal(`${url} is not a valid URL`);
        });
        it('should be from the server cloudinary.com/parkapi domain', () => {
            const url = 'https://www.google.com';
            typeChecker.analyseURL(url);
            typeChecker.errors[0].should.equal(`${url} is not from our cloud service`);
        });
    });

    context('--> Date', () => {
        it('Should convert ISO Date to "YYY-MM-DD" format', () => {
            const date = new Date('2007-04-05T14:30Z');
            (typeChecker.validDateUTC(date, 'someDate')).should.equal('2007-04-05');
        });
    });

    context('--> Check Date Difference', () => {
        it('[2017-12-02] is newer than [2015-05-10] ', () => {
            typeChecker.checkDateOneOlder('2017-12-02', '2015-05-10').should.equal(false);
        });
        it('[1994-01-02] is older than [2015-05-10] ', () => {
            typeChecker.checkDateOneOlder('1994-01-02', '2015-05-10').should.equal(true);
        });
    });

    context('--> Address', () => {
        it('should sanitize the input(trim,lower)', () => {
            typeChecker.analyseAddress('  209 aRLington WAy  ').should.equal('209 arlington way');
        });
        it('Should have numbers, alphabets and / and ,', () => {
            typeChecker.analyseAddress('209-0 arlington Way');
            (typeChecker.errors[0]).should.equal('Address should not contain special characters other than , and /');
        });
    });

    context('--> City ', () => {
        it('should sanitize the input(trim,lower)', () => {
            typeChecker.analyseCity('  SAN FRANCIScO').should.equal('San Francisco');
        });
        it('Should have only alphabets ', () => {
            typeChecker.analyseCity('123San Francisco');
            (typeChecker.errors[0]).should.equal('123san Francisco-city cannot contain any special characters');
        });
    });

    context('--> State', () => {
        it('should sanitize the input', () => {
            typeChecker.analyseState('  n Y  ').should.equal('NY');
        });

        it('should not be more than 2 characters', () => {
            typeChecker.analyseState('kjhgf');
            (typeChecker.errors[0]).should.equal('KJHGF-state should be of 2 characters');
        });
    });

    context('--> Country', () => {
        it('should sanitize the input(trim,lower)', () => {
            typeChecker.analyseCountry('  United    States Of America  ').should.equal('United States Of America');
        });
        it('Should have only alphabets ', () => {
            typeChecker.analyseCountry('123USA');
            (typeChecker.errors[0]).should.equal('123usa-country cannot contain any special characters');
        });
    });

    context('--> Zipcode ', () => {
        it('should contain only numbers', () => {
            typeChecker.analyseZipcode('ABKc');
            (typeChecker.errors[0]).should.equal('ABKc-zipcode provided is not valid');
        });
        it('should sanitize the input(trim,remove space)', () => {
            typeChecker.analyseZipcode('146  23  ').should.equal('14623');
        });
    });

    context('--> Description', () => {
        it('should sanitize the input(trim,lower)', () => {
            typeChecker.analyseDescription('HELLO this is a Test STATEMENT  ').should.equal('hello this is a test statement');
        });
    });

    context('--> Editor Notes', () => {
        it('should sanitize the input(trim,lower)', () => {
            typeChecker.analyseEditorNotes('HELLO this is a Test STATEMENT  ').should.equal('HELLO this is a Test STATEMENT');
        });
    });

    context('--> Email', () => {
        it('should sanitize the input(trim,lower)', () => {
            typeChecker.analyseEmail('Richard . JohnSon@gmail.com').should.equal('richard.johnson@gmail.com');
        });
        it('should be a valid email id ', () => {
            typeChecker.analyseEmail('richardJohnsongmail.com');
            (typeChecker.errors[0]).should.equal('richardjohnsongmail.com is not a valid email');
        });
    });

    context('--> Editor Format', () => {
        it('should be of valid format', () => {
            typeChecker.analyseEditorFormat('richard / richard@gmail.com ');
            (typeChecker.errors[0]).should.equal('addedBy is not in the format of [personName-emailID]');
        });
        it('should have valid name and emailID', () => {
            typeChecker.analyseEditorFormat('richard - richardgmail.com ');
            (typeChecker.errors[0]).should.not.deep.equal([]);
        });
        it('should output correct format [personName-emailID] after sanitizing', () => {
            typeChecker.analyseEditorFormat('paul newmann - paulNewman@gmail.com')
                .should.equal('Paul Newmann-paulnewman@gmail.com');
        });
    });

    context('--> Memory Type', () => {
        it('should sanitize the input and valid memoryType', () => {
            typeChecker.analyseMemoryType('Statues');
            typeChecker.errors[0].should.equal('STATUES does not belong to type \'memory_type\'');
        });
    });

    context('--> Latitude and Longitude', () => {
        it('should accept only valid coordinates', () => {
            typeChecker.analyseLatLong('a1.0', '2.0');
            typeChecker.errors[0].should.equal('The coordinates are not valid');
        });
    });

    context('--> Edit Type', () => {
        it('should sanitize the input and valid editType', () => {
            typeChecker.analyseEditType('Statues');
            typeChecker.errors[0].should.equal('STATUES does not belong to type in \'nameOfEntry\'');
        });
    });

    context('--> Social Media', () => {
        it('should sanitize the input', () => {
            const url = 'https:// github.com/SamuelTardy  ';
            const array = 'https://github.com/SamuelTardy';
            (typeChecker.analyseSocialMedia(url)).should.equal(array);
        });
        it('should be well formed URL', () => {
            const url = 'https:!/www.google.com';
            typeChecker.analyseSocialMedia(url);
            (typeChecker.errors[0]).should.equal(`${url} is not a valid URL`);
        });
    });
});

