import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjetService } from 'app/entities/projet/projet.service';
import { IProjet, Projet } from 'app/shared/model/projet.model';

describe('Service Tests', () => {
  describe('Projet Service', () => {
    let injector: TestBed;
    let service: ProjetService;
    let httpMock: HttpTestingController;
    let elemDefault: IProjet;
    let expectedResult: IProjet | IProjet[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule]
      });
      expectedResult = null;
      injector = getTestBed();
      service = injector.get(ProjetService);
      httpMock = injector.get(HttpTestingController);

      elemDefault = new Projet(0, 'AAAAAAA', 'image/png', 'AAAAAAA', 'AAAAAAA', 0, false, false);
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find(123).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should create a Projet', () => {
        const returnedFromService = Object.assign(
          {
            id: 0
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.create(new Projet()).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'POST' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should update a Projet', () => {
        const returnedFromService = Object.assign(
          {
            nom: 'BBBBBB',
            descriptionPDF: 'BBBBBB',
            descriptionTexte: 'BBBBBB',
            nbEtudiant: 1,
            automatique: true,
            archive: true
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of Projet', () => {
        const returnedFromService = Object.assign(
          {
            nom: 'BBBBBB',
            descriptionPDF: 'BBBBBB',
            descriptionTexte: 'BBBBBB',
            nbEtudiant: 1,
            automatique: true,
            archive: true
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.query().subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush([returnedFromService]);
        httpMock.verify();
        expect(expectedResult).toContainEqual(expected);
      });

      it('should delete a Projet', () => {
        service.delete(123).subscribe(resp => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: 'DELETE' });
        req.flush({ status: 200 });
        expect(expectedResult);
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
