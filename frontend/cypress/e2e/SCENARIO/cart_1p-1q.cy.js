import {connexion} from "../FUNCTIONS/connection"

describe('adding a product to the cart', ()=> {
    let authToken;
    let orderLines;

    //On connecte l'utilisateur via l'API
    it('login test true', () => {
        cy.request ({
            method: 'POST',
            url:'http://localhost:8081/login',
            body: {
                username: 'test2@test.fr',
                password: 'testtest'
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');

            authToken = response.body.token;
        })
    })

    //On vérifie si il y a des produits dans le panier et si oui, on les supprime
    it('verify order lines', () => {
        cy.request({
          method: 'GET',
          url: 'http://localhost:8081/orders',
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }).then((response) => {
            expect(response.status).to.eq(200);
            orderLines = response.body.orderLines;
            orderLines.forEach(line => {
                cy.request({
                    method: 'DELETE',
                    url: 'http://localhost:8081/orders/'+line.id+'/delete',
                    headers: {
                      Authorization: `Bearer ${authToken}`
                    }
                })
            });
        }) 
    })

    //On va sur le site 
    it('adding a product to the cart', () => {
        connexion ()

        //On va sur la page des produits pour en sélectionner un
        cy.get ('[data-cy="nav-link-products"]').click();
        cy.get ('button').eq(2).should('contain', 'Consulter').click();

        //On ajoute au panier une quantité négative     
        cy.get ('[data-cy="detail-product-quantity"]').click();
        cy.get ('[data-cy="detail-product-quantity"]').clear();
        cy.get ('[data-cy="detail-product-quantity"]').type('-1');
        cy.get ('[data-cy="detail-product-add"]').click();

        //On va sur le panier, le produit ne doit pas être présent
        cy.get ('[data-cy="nav-link-cart"]').click();
        cy.wait(500)
        cy.contains ('Poussière de lune').should('not.exist');
    })
})